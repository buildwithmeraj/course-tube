import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDB } from "./getDB";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials Provider
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // Authorize user credentials
      async authorize(credentials) {
        // if no credentials, return error
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // connect to database
          const db = await getDB();
          // access users collection
          const usersCollection = db.collection("users");

          // find user by email
          const user = await usersCollection.findOne({
            email: credentials.email,
          });

          if (!user) throw new Error("No user found with this email");

          // compare hashed passwords
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) throw new Error("Invalid password");

          // return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            image: user.image || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  // JWT session strategy
  session: {
    strategy: "jwt",
  },

  // Callbacks
  callbacks: {
    // Handle actions after sign in
    async signIn({ user, account, profile }) {
      // If signing in with Google, save user to database if not exists
      if (account?.provider === "google") {
        try {
          const db = await getDB();
          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({
            email: user.email,
          });

          if (!existingUser) {
            await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "user",
              provider: "google",
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Error saving Google user:", error);
        }
      }
      return true;
    },

    // Include user info in JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image || null;
        token.role = user.role || "user";
      }

      // Ensure OAuth users get role
      if (account?.provider === "google" && token.email && !token.role) {
        const db = await getDB();
        const usersCollection = db.collection("users");
        const dbUser = await usersCollection.findOne({ email: token.email });
        token.role = dbUser?.role || "user";
      }

      return token;
    },

    // Include user info in session object
    async session({ session, token }) {
      // Attach user info from token to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role || "user";
        session.user.image = token.picture || null;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsersDB } from "./getDB";
import { checkRateLimit } from "./rateLimit";
import { RATE_LIMITS } from "./limits";

// Registration stores emails lowercased, so every lookup must match that
const normaliseEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

// NextAuth hands `authorize` a request whose headers may be a plain object or
// a Headers instance depending on the adapter
const headerValue = (req, name) => {
  const headers = req?.headers;
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] ?? null;
};

const clientIpFrom = (req) => {
  const forwarded = headerValue(req, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headerValue(req, "x-real-ip") || "unknown";
};

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
      async authorize(credentials, req) {
        // if no credentials, return error
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Throttle before touching the database: per account, so one address
          // cannot be brute-forced, and per IP, so one host cannot spray many.
          const email = normaliseEmail(credentials.email);
          const attempts = await Promise.all([
            checkRateLimit({ key: `signin:email:${email}`, ...RATE_LIMITS.signIn }),
            checkRateLimit({
              key: `signin:ip:${clientIpFrom(req)}`,
              ...RATE_LIMITS.signIn,
            }),
          ]);

          if (attempts.some((attempt) => !attempt.allowed)) {
            throw new Error("Too many sign-in attempts. Please try again later.");
          }

          // connect to database
          const db = await getUsersDB();
          // access users collection
          const usersCollection = db.collection("users");

          // find user by email
          const user = await usersCollection.findOne({ email });

          if (!user) throw new Error("No user found with this email");

          // compare hashed passwords
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const db = await getUsersDB();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
          email: normaliseEmail(user.email),
        });

        if (!existingUser) {
          await usersCollection.insertOne({
            email: normaliseEmail(user.email),
            name: user.name,
            image: user.image,
            role: "user",
            provider: "google",
            createdAt: new Date(),
          });
        }
      }
      return true;
    },

    // Include user info in JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image || null;
        token.role = user.role || "user";
      }

      // ALWAYS fetch role from DB for Google users AND credentials users
      if (token.email && (account?.provider === "google" || !account)) {
        const db = await getUsersDB();
        const usersCollection = db.collection("users");

        const dbUser = await usersCollection.findOne({
          email: normaliseEmail(token.email),
        });
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

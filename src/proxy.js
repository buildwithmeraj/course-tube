import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
const privateRoutes = ["/profile", "/dashboard"];
const adminRoutes = ["/dashboard"];

// This function can be marked `async` if using `await` inside
export async function proxy(request) {
  // get token from request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  // get the requested path
  const reqPath = request.nextUrl.pathname;
  // check if the user is authenticated
  const isAuthenticated = Boolean(token);
  // check if the user is admin
  const isAdmin = token?.role === "admin";
  // check if the requested path is private
  const isPrivateRoute = privateRoutes.some((route) =>
    reqPath.startsWith(route)
  );
  // check if the requested path is for admins only
  const isAdminRoute = adminRoutes.some((route) => reqPath.startsWith(route));
  // check if the requested path is a course sub-page
  const isCourseSubPage = /^\/courses\/[^\/]+\/.+/.test(reqPath);

  // redirect unauthencticated users to the login page
  if ((isPrivateRoute || isCourseSubPage) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // redirect non-admin users to the login page if not an admin and logout
  if (isAdminRoute && isAuthenticated && !isAdmin) {
    return NextResponse.redirect(new URL("/logout", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/courses/:path/:path*"],
};

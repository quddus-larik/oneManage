import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/tasks(.*)",
  "/departments(.*)",
  "/employees(.*)",
  "/sso-callback",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // ✅ Public routes
  if (path === "/" || path.startsWith("/tasks/yourtask")) {
    return;
  }

  // ✅ Block protected routes if not logged in
  if (isProtectedRoute(req) && !userId) {
    const html = `
      <html lang="en">
        <head>
          <title>Unauthorized Access</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              color: #111;
              text-align: center;
            }
            a {
              color: #2563eb;
              text-decoration: none;
              font-weight: 600;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div>
            <h2>Unauthorized Access</h2>
            <p>Please <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/sign-in">login here</a> to continue.</p>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|static|.*\\..*|favicon.ico|auth).*)",
    "/(api|trpc)(.*)",
  ],
};



import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PERMANENT_REDIRECTS: Record<string, string> = {
  "/themes": "/wordpress-themes",
  "/plugins": "/wordpress-plugins",
  "/templates": "/html-templates",
  "/snippets": "/code-snippets",
  "/products/agency-bundle": "/bundles",
  "/products/free-tools": "/freebies",
  "/deals": "/pricing",
  "/elementor-alternatives": "/alternatives/elementor",
  "/astra-alternatives": "/alternatives/astra",
  "/yoast-alternatives": "/alternatives/yoast",
  "/faq": "/faqs",
  "/signup": "/login",
  "/dashboard": "/account",
  "/dashboard/downloads": "/account/library",
  "/dashboard/licenses": "/account/library",
  "/dashboard/purchases": "/account/orders",
  "/dashboard/membership": "/account/membership",
  "/dashboard/settings": "/account/settings",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Google Search Console auto-verification for any google*.html verification file
  if (pathname.startsWith("/google") && pathname.endsWith(".html")) {
    const filename = pathname.replace("/", "");
    return new NextResponse(`google-site-verification: ${filename}`, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  if (PERMANENT_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(PERMANENT_REDIRECTS[pathname], request.url), 301);
  }

  // P0-4: Fast-path for public routes — skip Supabase auth network roundtrips completely
  const isProtected =
    pathname.startsWith("/account") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");
  if (!isProtected) {
    return NextResponse.next({ request });
  }

  return await updateSession(request);
}

// Named alias for backward compatibility
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

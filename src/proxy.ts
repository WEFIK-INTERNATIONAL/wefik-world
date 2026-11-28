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

const CANONICAL_HOST_REDIRECT_EXCLUDED_PREFIXES = ['/api/', '/_next/'];

function getCanonicalHostRedirect(request: NextRequest): NextResponse | null {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!configured) return null;

  let canonicalUrl: URL;
  try {
    canonicalUrl = new URL(configured);
  } catch {
    return null;
  }

  const reqHost = request.nextUrl.hostname.toLowerCase();
  const targetHost = canonicalUrl.hostname.toLowerCase();
  if (reqHost === targetHost) return null;

  // Only redirect between apex and www siblings of the configured canonical host
  const stripWww = (h: string) => (h.startsWith('www.') ? h.slice(4) : h);
  if (stripWww(reqHost) !== stripWww(targetHost)) return null;

  const { pathname } = request.nextUrl;
  if (CANONICAL_HOST_REDIRECT_EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const target = request.nextUrl.clone();
  target.protocol = canonicalUrl.protocol;
  target.hostname = canonicalUrl.hostname;
  target.port = canonicalUrl.port;
  return NextResponse.redirect(target, 308);
}

export async function proxy(request: NextRequest) {
  const canonicalRedirect = getCanonicalHostRedirect(request);
  if (canonicalRedirect) {
    return canonicalRedirect;
  }

  const { pathname } = request.nextUrl;

  // Never intercept /auth/callback with session refresh or rate limiting
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request });
  }
  
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

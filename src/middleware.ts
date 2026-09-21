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
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (PERMANENT_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(PERMANENT_REDIRECTS[pathname], request.url), 301);
  }

  return await updateSession(request);
}

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

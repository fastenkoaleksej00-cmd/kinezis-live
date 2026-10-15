import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseWs = supabaseUrl?.replace(/^http/, "ws");

/**
 * Content Security Policy. Next.js injects inline scripts (RSC payload) and
 * inline styles (motion), so 'unsafe-inline' is needed without a nonce setup.
 * connect-src includes the Supabase project when configured; the video host is added with stage 7.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabaseUrl ? ` ${supabaseUrl} ${supabaseWs}` : ""}`,
  `media-src 'self' blob:${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The skeleton is 2.4 MB and never changes in place (rename the file to ship a new one), so browsers keep it
      { source: "/models/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default withNextIntl(nextConfig);

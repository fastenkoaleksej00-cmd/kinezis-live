import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KINEZIS LIVE",
    short_name: "KINEZIS LIVE",
    description: "Movement · Recovery · Care",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8f8",
    theme_color: "#f5f8f8",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/lib/seo/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} — Publica tu blog`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#faf9f7",
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}

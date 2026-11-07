import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatsApp Business CRM",
    short_name: "WA CRM",
    description: "WhatsApp CRM — Inbox, Contacts, Pipelines, Broadcasts & Automations",
    start_url: "/inbox",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b141a",
    theme_color: "#00a884",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

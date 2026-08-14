import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bhajiwala - Pav Bhaji Delivery",
    short_name: "Bhajiwala",
    description: "Order fresh Pav Bhaji inside Shri Krishna Science Centre, Pune.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e5",
    theme_color: "#d74722",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

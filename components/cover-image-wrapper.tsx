"use client";

import { usePathname } from "next/navigation";
import { CoverImage } from "./CoverImage";

export function CoverImageWrapper() {
  const pathname = usePathname() || "/";
  // Convert pathname to a URL-safe string for the pageId
  const pageId = pathname.replace(/\//g, "-").slice(1) || "home";

  return <CoverImage pageId={pageId} />;
}

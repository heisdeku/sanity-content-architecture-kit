import { fontClassName } from "@/features/fonts/fonts";
import "./globals.css";

/**
 * Root layout: fonts and globals only, no data. The site shell (header,
 * footer, smooth scroll, draft banner) lives in app/(site)/layout.tsx so the
 * Studio route renders bare and the build never calls Sanity for it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontClassName} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

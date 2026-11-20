import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { TabBar } from "@/components/tab-bar";
export const metadata: Metadata = {
  title: "Discover · Coy",
  description:
    "Meet someone new. Find out when it’s mutual. A standalone Coy assessment.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <Link
              className="wordmark"
              href="/discover"
              aria-label="Coy Discover"
            >
              coy<span>.</span>
            </Link>
            <span className="header-note">
              A little curiosity goes a long way.
            </span>
          </header>
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}

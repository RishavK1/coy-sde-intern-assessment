"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House } from "lucide-react";
export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      <Link
        href="/"
        className={path === "/" ? "tab active" : "tab"}
        aria-current={path === "/" ? "page" : undefined}
      >
        <House size={21} />
        <span>Home</span>
      </Link>
      <Link
        href="/discover"
        className={path.startsWith("/discover") ? "tab active" : "tab"}
        aria-current={path.startsWith("/discover") ? "page" : undefined}
      >
        <Compass size={21} />
        <span>Discover</span>
      </Link>
    </nav>
  );
}

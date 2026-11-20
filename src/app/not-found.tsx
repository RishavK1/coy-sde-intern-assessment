import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>Nothing here yet.</h1>
      <Link className="button primary" href="/discover">
        Go to Discover
      </Link>
    </main>
  );
}

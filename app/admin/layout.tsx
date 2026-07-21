import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="container">
      <div className="admin-bar">
        <span className="admin-badge">Admin</span>
        <nav>
          <Link href="/admin">Categories</Link>
          <Link href="/">View site</Link>
        </nav>
        <form action={signOut}>
          <button className="btn btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}

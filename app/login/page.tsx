import type { Metadata } from "next";
import { signIn } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, reason } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Admin login</h1>

        {!configured || reason === "unconfigured" ? (
          <p className="notice">
            <strong>Supabase is not configured.</strong> The public site runs
            from seed data, but admin login and editing need
            <code> NEXT_PUBLIC_SUPABASE_URL</code> and
            <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
            <code> .env.local</code>. See the README for setup.
          </p>
        ) : null}

        {reason === "forbidden" ? (
          <p className="notice">
            This account is signed in but doesn&apos;t have the{" "}
            <strong>admin</strong> role. See “First admin user” in the README.
          </p>
        ) : null}

        {error ? <p className="notice">{error}</p> : null}

        <form action={signIn}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={!configured}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
            />
          </div>
          <button className="btn" type="submit" disabled={!configured}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="page-head">
        <p className="kicker">404</p>
        <h1>That page isn&apos;t ranked — or doesn&apos;t exist.</h1>
        <p className="lede">
          Try the <Link href="/rankings">full rankings directory</Link>.
        </p>
      </div>
    </div>
  );
}

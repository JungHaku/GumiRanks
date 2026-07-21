import Image from "next/image";
import Link from "next/link";
import { GUMI, SITE } from "@/lib/site";
import { HeaderSearch } from "./header-search";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="wordmark" aria-label={`${SITE.name} home`}>
          <Image
            src={GUMI.face}
            alt=""
            width={40}
            height={40}
            className="wordmark-gumi"
            priority
          />
          <span>
            {SITE.name.toLowerCase()}
            <span className="wordmark-dot">.</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/rankings">All rankings</Link>
        </nav>
        <span className="header-spacer" />
        <HeaderSearch />
        <Link href="/admin" className="admin-link">
          Admin
        </Link>
      </div>
    </header>
  );
}

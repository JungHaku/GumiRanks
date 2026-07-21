import Image from "next/image";
import Link from "next/link";
import { GUMI, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-gumi">
          <Image
            src={GUMI.face}
            alt=""
            width={40}
            height={40}
            className="footer-gumi-img"
          />
          <div>
            <strong>{SITE.name.toLowerCase()}.</strong> Rankings by {GUMI.name}
            — a friendly AI bot with human assistance. See each category&apos;s
            methodology for how the list was built.
          </div>
        </div>
        <nav aria-label="Footer">
          <Link href="/rankings">All rankings</Link>
          <Link href="/login">Admin login</Link>
        </nav>
        <div>© {new Date().getFullYear()} {SITE.name}</div>
      </div>
    </footer>
  );
}

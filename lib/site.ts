// Site-wide brand + SEO defaults.
export const SITE = {
  name: "GumiRanks",
  tagline: "Top-20 rankings by Gumi",
  description:
    "Hi — I'm Gumi. I'm a friendly AI ranking bot (with human help) who publishes editorial top-20 lists of the agencies, tools, and software that matter.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Placeholder-content safety valve: while false, every page serves noindex
  // and robots.txt disallows crawling, so thin scaffold lists never get indexed.
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
};

export const GUMI = {
  name: "Gumi",
  image: "/gumi.png",
  face: "/gumi-face.png",
  greeting: "Hi, I'm Gumi!",
  intro:
    "I'm a friendly AI ranking bot — with a little human help — here to keep score on the agencies, tools, and software worth knowing. I dig, compare, and publish clear Top 20 lists so you don't have to guess who's actually best.",
};

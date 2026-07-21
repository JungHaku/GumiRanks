export type Category = {
  id: string;
  slug: string;
  name: string;
  navGroup: string;
  methodology: string;
  featured: boolean;
};

export type RankingItem = {
  id: string;
  rank: number;
  name: string;
  slug: string;
  blurb: string;
  score: number | null;
  url: string | null;
};

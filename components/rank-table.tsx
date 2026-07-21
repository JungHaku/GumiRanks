import type { RankingItem } from "@/lib/data/types";

export function RankTable({ items }: { items: RankingItem[] }) {
  return (
    <ol className="rank-table">
      {items.map((item) => (
        <li key={item.id} className={`rank-row${item.rank <= 3 ? " top" : ""}`}>
          <span className="rank-num" aria-label={`Rank ${item.rank}`}>
            {item.rank}
          </span>
          <span>
            <span className="rank-name">{item.name}</span>
            {item.url ? (
              <a
                className="rank-url"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit ↗
              </a>
            ) : null}
          </span>
          {item.score !== null ? (
            <span className="rank-score">{item.score.toFixed(1)}</span>
          ) : (
            <span />
          )}
          {item.blurb ? <p className="rank-blurb">{item.blurb}</p> : null}
        </li>
      ))}
    </ol>
  );
}

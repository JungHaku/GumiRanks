"use client";

import { useRef, useState, useTransition } from "react";
import { saveRanking } from "@/app/admin/actions";
import { MAX_RANKING_ITEMS } from "@/lib/data/constants";
import {
  parseRankingCsv,
  rankingCsvTemplate,
  type ImportedRankingItem,
} from "@/lib/data/ranking-csv";
import type { Category, RankingItem } from "@/lib/data/types";

type Row = {
  key: number;
  name: string;
  blurb: string;
  score: string;
  url: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export function RankingEditor({
  category,
  initialItems,
}: {
  category: Category;
  initialItems: RankingItem[];
}) {
  const [name, setName] = useState(category.name);
  const [methodology, setMethodology] = useState(category.methodology);
  const [featured, setFeatured] = useState(category.featured);
  const [rows, setRows] = useState<Row[]>(
    initialItems.map((item, index) => ({
      key: index,
      name: item.name,
      blurb: item.blurb,
      score: item.score === null ? "" : String(item.score),
      url: item.url ?? "",
    }))
  );
  const [nextKey, setNextKey] = useState(initialItems.length);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    items: ImportedRankingItem[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
  };

  const remove = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof Omit<Row, "key">, value: string) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    if (rows.length >= MAX_RANKING_ITEMS) return;
    setRows([...rows, { key: nextKey, name: "", blurb: "", score: "", url: "" }]);
    setNextKey(nextKey + 1);
  };

  const selectCsv = async (file: File | undefined) => {
    setImportErrors([]);
    setPendingImport(null);
    if (!file) return;

    const result = parseRankingCsv(await file.text());
    if (!result.ok) {
      setImportErrors(result.errors);
      return;
    }

    setPendingImport({ fileName: file.name, items: result.items });
  };

  const applyImport = () => {
    if (!pendingImport) return;
    const baseKey = nextKey;
    setRows(
      pendingImport.items.map((item, index) => ({
        key: baseKey + index,
        name: item.name,
        blurb: item.blurb,
        score: item.score,
        url: item.url,
      }))
    );
    setNextKey(baseKey + pendingImport.items.length);
    setPendingImport(null);
    setImportErrors([]);
    setStatus({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const blob = new Blob([rankingCsvTemplate()], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${category.slug}-ranking-template.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  const save = () => {
    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result = await saveRanking(category.slug, {
        name,
        methodology,
        featured,
        items: rows.map(({ name, blurb, score, url }) => ({ name, blurb, score, url })),
      });
      setStatus(
        "error" in result
          ? { kind: "error", message: result.error }
          : { kind: "saved" }
      );
    });
  };

  return (
    <div className="page-body">
      <div className="page-head" style={{ paddingTop: "1.5rem" }}>
        <p className="kicker">{category.navGroup}</p>
        <h1>Edit: {category.name}</h1>
        <p className="lede">
          Slug <code>/{`rankings/${category.slug}`}</code> is fixed — published
          URLs never change.
        </p>
      </div>

      <div className="editor-head">
        <div className="field">
          <label htmlFor="cat-name">Category name</label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="cat-methodology">Methodology</label>
          <textarea
            id="cat-methodology"
            rows={3}
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
          />
        </div>
        <label className="editor-check">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured on the home page
        </label>
      </div>

      <section className="csv-import" aria-labelledby="csv-import-title">
        <div className="csv-import-copy">
          <p className="kicker">Bulk update</p>
          <h2 id="csv-import-title">Import ranking items from CSV</h2>
          <p>
            Upload <code>rank,name,blurb,score,url</code>. Only rank and name are
            required. The file is validated and previewed before it replaces the
            rows below; nothing goes live until you select Save &amp; publish.
          </p>
        </div>
        <div className="csv-import-actions">
          <label className="btn csv-upload">
            Choose CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void selectCsv(event.target.files?.[0])}
            />
          </label>
          <button type="button" className="btn btn-ghost" onClick={downloadTemplate}>
            Download template
          </button>
        </div>

        {importErrors.length > 0 ? (
          <div className="csv-feedback error" role="alert">
            <strong>Fix these CSV issues:</strong>
            <ul>
              {importErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {pendingImport ? (
          <div className="csv-preview" aria-live="polite">
            <div>
              <strong>
                {pendingImport.items.length} items ready from {pendingImport.fileName}
              </strong>
              <p>
                Preview:{" "}
                {pendingImport.items
                  .slice(0, 3)
                  .map((item) => `${item.rank}. ${item.name}`)
                  .join(" · ")}
                {pendingImport.items.length > 3 ? " …" : ""}
              </p>
            </div>
            <div className="csv-preview-actions">
              <button type="button" className="btn" onClick={applyImport}>
                Use imported rows
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setPendingImport(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <h2 className="section-title">
        Ranked items <small>({rows.length} / {MAX_RANKING_ITEMS})</small>
      </h2>

      <div className="editor-col-labels">
        <span>#</span>
        <span>Name</span>
        <span>Blurb</span>
        <span>Score</span>
        <span>URL</span>
        <span>Actions</span>
      </div>

      <ol className="editor-rows">
        {rows.map((row, index) => (
          <li key={row.key} className="editor-row">
            <span className="pos">{index + 1}</span>
            <input
              aria-label={`Item ${index + 1} name`}
              placeholder="Name"
              value={row.name}
              onChange={(e) => update(index, "name", e.target.value)}
            />
            <input
              aria-label={`Item ${index + 1} blurb`}
              placeholder="Blurb"
              value={row.blurb}
              onChange={(e) => update(index, "blurb", e.target.value)}
            />
            <input
              aria-label={`Item ${index + 1} score`}
              placeholder="Score"
              inputMode="decimal"
              value={row.score}
              onChange={(e) => update(index, "score", e.target.value)}
            />
            <input
              aria-label={`Item ${index + 1} URL`}
              placeholder="https://…"
              inputMode="url"
              value={row.url}
              onChange={(e) => update(index, "url", e.target.value)}
            />
            <span className="row-actions">
              <button
                type="button"
                className="icon-btn"
                title="Move up"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Move down"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-btn danger"
                title="Delete"
                onClick={() => remove(index)}
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div className="editor-toolbar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={addRow}
          disabled={rows.length >= MAX_RANKING_ITEMS}
        >
          + Add item
        </button>
        <button type="button" className="btn" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save & publish"}
        </button>
        {status.kind === "saved" ? (
          <span className="save-status ok">Saved — live on the public site.</span>
        ) : null}
        {status.kind === "error" ? (
          <span className="save-status err">{status.message}</span>
        ) : null}
      </div>
    </div>
  );
}

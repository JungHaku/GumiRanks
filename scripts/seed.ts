// Seeds Supabase with the 25 locked categories × Top 20 placeholder items.
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
// DESTRUCTIVE for ranking_items: every category's item list is replaced.
// Run: npm run seed
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { CATEGORY_DEFS, methodologyFor } from "../lib/data/categories";
import { MAX_RANKING_ITEMS } from "../lib/data/constants";
import { seedItemsFor } from "../lib/data/seed";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    `Seeding ${CATEGORY_DEFS.length} categories × ${MAX_RANKING_ITEMS} items…`
  );

  // Remove categories that are no longer in CATEGORY_DEFS (v1 cut from 50 → 25).
  const keepSlugs = CATEGORY_DEFS.map((d) => d.slug);
  const { data: existing, error: listError } = await supabase
    .from("categories")
    .select("id, slug");
  if (listError) throw new Error(`List categories failed: ${listError.message}`);
  for (const row of existing ?? []) {
    if (!keepSlugs.includes(row.slug)) {
      const { error } = await supabase.from("categories").delete().eq("id", row.id);
      if (error) throw new Error(`Delete obsolete ${row.slug}: ${error.message}`);
      console.log(`  − removed ${row.slug}`);
    }
  }

  for (const def of CATEGORY_DEFS) {
    const { data: category, error: upsertError } = await supabase
      .from("categories")
      .upsert(
        {
          slug: def.slug,
          name: def.name,
          nav_group: def.group,
          methodology: methodologyFor(def.name, def.group, def.methodology),
          featured: Boolean(def.featured),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (upsertError || !category) {
      throw new Error(`Category upsert failed for ${def.slug}: ${upsertError?.message}`);
    }

    const { error: deleteError } = await supabase
      .from("ranking_items")
      .delete()
      .eq("category_id", category.id);
    if (deleteError) {
      throw new Error(`Item cleanup failed for ${def.slug}: ${deleteError.message}`);
    }

    const rows = seedItemsFor(def.slug).map((item) => ({
      category_id: category.id,
      rank: item.rank,
      name: item.name,
      slug: item.slug,
      blurb: item.blurb,
      score: item.score,
      url: item.url,
    }));
    const { error: insertError } = await supabase.from("ranking_items").insert(rows);
    if (insertError) {
      throw new Error(`Item insert failed for ${def.slug}: ${insertError.message}`);
    }

    console.log(`  ✓ ${def.name} (${rows.length} items)`);
  }

  console.log(`Done. ${CATEGORY_DEFS.length} categories seeded.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import Link from "next/link";
import { getCategories, groupCategories } from "@/lib/data/rankings";

export default async function AdminDashboard() {
  const categories = await getCategories();
  const groups = groupCategories(categories);

  return (
    <div className="page-body">
      <div className="page-head" style={{ paddingTop: "1.5rem" }}>
        <p className="kicker">Dashboard</p>
        <h1>Rankings</h1>
        <p className="lede">
          Pick a category to edit its Top 20, name, and methodology. Changes
          go live on save.
        </p>
      </div>
      {groups.map((g) => (
        <section key={g.group} className="group-section">
          <h2 className="section-title">{g.group}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {g.categories.map((c) => (
                <tr key={c.slug}>
                  <td>{c.name}</td>
                  <td>
                    <code>{c.slug}</code>
                  </td>
                  <td>{c.featured ? "Yes" : "—"}</td>
                  <td>
                    <Link href={`/admin/rankings/${c.slug}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

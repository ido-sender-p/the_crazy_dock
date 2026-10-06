import { Layout } from "../layout";
import { raw } from "hono/html";
import { docks } from "../data";
import { parsePhotoCredit, WIKIPEDIA_LICENSE } from "../lib/credits";

const PAGE_CSS = `
  .credits-page { padding: 56px 0 100px; max-width: 980px; }
  .credits-page h2 { font-size: 1.15rem; margin-top: 32px; }
  .credits-page p { font-size: 0.95rem; }
  .credits-page .notice {
    background: #fdf3e2; border: 1px solid #e9c17a; color: #7a5108;
    padding: 14px 18px; border-radius: 10px; font-size: 0.88rem;
  }
  .credits-page .table-wrap { overflow-x: auto; margin-top: 12px; }
  .credits-page table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .credits-page th, .credits-page td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .credits-page th { color: var(--ink-soft); font-weight: 600; }
`;

// Every catalogue dock whose photo credit parses (Wikimedia Commons), sorted by dock name.
// Built once: the catalogue only changes between deploys.
const rows = docks
  .flatMap((d) => {
    const c = parsePhotoCredit(d.imageAttribution);
    return c ? [{ slug: d.slug, name: d.name, country: d.country, credit: c, textSource: d.descriptionSource ?? "" }] : [];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export function CreditsPage(opts: { path: string; contactEmail?: string }) {
  const email = opts.contactEmail?.trim();
  return (
    <Layout
      title="Photo and text credits | Wildock"
      description="Authors, licences and sources of the photos and descriptions shown on Wildock."
      path={opts.path}
    >
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap credits-page">
        <h1>Photo and text credits</h1>
        <p>
          Dock photos come from{" "}
          <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> and are used under
          the licence each author chose (CC0, public domain, CC BY or CC BY-SA). We resize and crop them to fit the page. Descriptions
          are shortened from{" "}
          <a href="https://www.wikipedia.org/" target="_blank" rel="noopener noreferrer">Wikipedia</a> articles, which are available
          under{" "}
          <a href={WIKIPEDIA_LICENSE.url} target="_blank" rel="noopener noreferrer license">{WIKIPEDIA_LICENSE.name}</a>. Counts of nearby restaurants, shops, hotels and sights come from
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> data (&copy; OpenStreetMap contributors, ODbL). Photos
          uploaded by Wildock members belong to the members who took them.
        </p>

        <h2>Report a problem or ask for removal</h2>
        {email ? (
          <p>
            If a photo or text on Wildock infringes your rights, or you are the author and want the credit changed, write to{" "}
            <a href={`mailto:${email}`}>{email}</a> with the page address. We will correct the credit or remove the item promptly.
          </p>
        ) : (
          <div class="notice">Contact details for takedown and credit requests are being set up.</div>
        )}

        <h2>All photos ({rows.length})</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Dock</th>
                <th scope="col">Photo author</th>
                <th scope="col">Licence</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr>
                  <td>
                    <a href={`/docks/${r.slug}`}>{r.name}</a>, {r.country}
                  </td>
                  <td>{r.credit.author}</td>
                  <td>
                    {r.credit.licenseUrl ? (
                      <a href={r.credit.licenseUrl} target="_blank" rel="noopener noreferrer license">{r.credit.license}</a>
                    ) : (
                      r.credit.license
                    )}
                  </td>
                  <td>
                    {r.credit.sourceUrl ? (
                      <a href={r.credit.sourceUrl} target="_blank" rel="noopener noreferrer">Commons file page</a>
                    ) : (
                      "Wikimedia Commons"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

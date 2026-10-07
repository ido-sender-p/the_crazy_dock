import { Layout } from "../components/layout";
import { docks } from "../data";
import { parsePhotoCredit, WIKIPEDIA_LICENSE } from "../lib/credits";

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
    <Layout page="credits"
      title="Photo and text credits | Wildock"
      description="Authors, licences and sources of the photos and descriptions shown on Wildock."
      path={opts.path}
    >
      <div class="wrap credits-page">
        <h1>Photo and text credits</h1>
        <p>
          Dock photos come from{" "}
          <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> and are used under
          the licence each author chose (CC0, public domain, CC BY or CC BY-SA). We resize and crop them to fit the page. Descriptions
          are shortened from{" "}
          <a href="https://www.wikipedia.org/" target="_blank" rel="noopener noreferrer">Wikipedia</a> articles, which are available
          under{" "}
          <a href={WIKIPEDIA_LICENSE.url} target="_blank" rel="noopener noreferrer license">{WIKIPEDIA_LICENSE.name}</a>. Counts of nearby restaurants, shops, hotels and sights come from{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> data (&copy; OpenStreetMap contributors, ODbL). Where no Wikipedia article exists, the short description is written only from OpenStreetMap data (type, place, berths, operator, facilities). Photos
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

import { Layout } from "../layout";
import { raw } from "hono/html";

const PAGE_CSS = `
  .accessibility-page { padding: 56px 0 100px; max-width: 720px; }
  .accessibility-page h1 { font-size: 1.7rem; }
  .accessibility-page h2 { font-size: 1.15rem; margin-top: 32px; }
  .accessibility-page p, .accessibility-page li { font-size: 0.95rem; color: var(--ink); }
  .accessibility-page ul { padding-inline-start: 22px; display: flex; flex-direction: column; gap: 6px; }
  .accessibility-page .updated { color: var(--ink-soft); font-size: 0.85rem; }
  .accessibility-page .notice {
    background: #fdf3e2; border: 1px solid #e9c17a; color: #7a5108;
    padding: 14px 18px; border-radius: 10px; font-size: 0.88rem; margin: 10px 0 0;
  }
`;

// Israeli law (the Equal Rights for Persons with Disabilities Regulations
// (Service Accessibility Adjustments), 2013) requires this statement to name
// a real accessibility coordinator with real contact details. The site
// owner hasn't designated one yet, so the .notice box below says so plainly
// rather than inventing a name/email, which would make the statement
// misleading instead of just incomplete. Update the contact section once
// that's set.
export function AccessibilityPage(opts: { path: string }) {
  const lastReviewed = new Date().toISOString().slice(0, 10);

  return (
    <Layout title="Accessibility statement | Wildock" description="Wildock's accessibility statement." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap accessibility-page">
        <h1>Accessibility statement</h1>
        <p>
          Wildock is working to make its service accessible to people with disabilities, and aims to meet the
          requirements of Israel's Equal Rights for Persons with Disabilities Regulations (Service Accessibility
          Adjustments), 2013, based on Israeli Standard 5568 and WCAG 2.0 Level AA.
        </p>

        <h2>Accessibility features on this site</h2>
        <ul>
          <li>Text size adjustment (three levels)</li>
          <li>High contrast mode</li>
          <li>Grayscale mode</li>
          <li>Underlined links</li>
          <li>Readable font</li>
          <li>Enlarged cursor</li>
          <li>Reading guide that follows the mouse</li>
          <li>Stopping animations and transitions</li>
        </ul>
        <p>These options can be turned on from the accessibility icon at the top of every page.</p>

        <h2>Known accessibility limitations</h2>
        <p>
          We're continually working to improve accessibility on this site. Some parts may not yet be fully
          adjusted to the standard. We welcome reports of any issue you run into.
        </p>

        <h2>Accessibility contact</h2>
        <p>You can reach out to us if you run into any difficulty using this site.</p>
        <div class="notice">
          An accessibility coordinator's contact details haven't been set yet. Until this section is updated,
          this statement doesn't fully meet the legal requirement.
        </div>

        <h2>Last reviewed</h2>
        <p class="updated">This statement was last reviewed on {lastReviewed}.</p>
      </div>
    </Layout>
  );
}

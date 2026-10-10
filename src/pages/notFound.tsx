import { Layout } from "../components/layout";

export function NotFoundPage(opts: { path: string }) {
  return (
    <Layout page="notFound" title="Page not found | Wildock" description="This page does not exist." path={opts.path} noindex>
      <div class="wrap not-found-page">
        <p class="kicker">404</p>
        <h1>We could not find that page</h1>
        <p>The link may be old, or the dock may have moved. Search for it, or go back to the start.</p>
        <form class="search-form" method="get" action="/search">
          <input type="search" name="q" placeholder="Search docks and places" aria-label="Search" />
          <button type="submit">Search</button>
        </form>
        <p>
          <a href="/">Back to the home page</a>
        </p>
      </div>
    </Layout>
  );
}

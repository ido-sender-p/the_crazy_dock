import { Layout } from "../layout";
import { raw } from "hono/html";
import type { UserSearchResult, LocationSearchResult } from "../lib/search";

export type SearchFilter = "all" | "profile" | "location" | "dock";

const PAGE_CSS = `
  .search-page { padding: 56px 0 100px; max-width: 680px; }
  .search-page h1 { font-size: 1.7rem; }
  .search-form { display: flex; gap: 10px; margin: 20px 0 18px; }
  .search-form input {
    flex: 1; padding: 12px 16px; border: 1px solid var(--border); border-radius: 999px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .search-form input:focus { outline: none; border-color: var(--accent); }
  .search-form button {
    border: none; border-radius: 999px; padding: 0 22px; background: var(--accent); color: #06121f;
    font-weight: 600; cursor: pointer; font-size: 0.9rem;
  }

  .search-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
  .search-filters a {
    display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
    border: 1px solid var(--border); border-radius: 999px; padding: 7px 16px;
    font-size: 0.85rem; font-weight: 600; color: var(--ink-soft);
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
  }
  .search-filters a:hover { border-color: var(--accent); color: var(--accent-dark); }
  .search-filters a.active { background: var(--accent); border-color: var(--accent); color: #06121f; }

  .search-page section { margin-top: 28px; }
  .search-page .kicker {
    color: var(--accent-dark); font-weight: 600; font-size: 0.78rem; text-transform: uppercase;
    letter-spacing: 0.06em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
  }
  .search-page .kicker svg { width: 14px; height: 14px; }
  .result-list { display: flex; flex-direction: column; gap: 10px; }
  .result-row {
    display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;
    padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    transition: border-color 0.15s ease, transform 0.15s ease;
  }
  .result-row:hover { border-color: var(--accent); transform: translateY(-1px); }
  .result-icon {
    width: 38px; height: 38px; border-radius: 50%; flex: none; object-fit: cover;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-weight: 600; font-size: 0.9rem;
  }
  .result-icon.location { background: var(--surface); border: 1px solid var(--border); color: var(--accent-dark); }
  .result-icon svg { width: 17px; height: 17px; }
  .result-row .name { font-weight: 600; font-size: 0.92rem; }
  .result-row .place { color: var(--ink-soft); font-size: 0.83rem; }
  .search-page .empty { padding: 24px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); font-size: 0.9rem; }
`;

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);
const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v13M5 13a7 7 0 0 0 14 0M5 13H3M21 13h-2" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

type DockResult = { slug: string; name: string; country: string | null; settlement: string | null };

const FILTER_LABELS: { value: SearchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "profile", label: "Profiles" },
  { value: "location", label: "Locations" },
  { value: "dock", label: "Docks" },
];

export function SearchPage(opts: {
  q: string;
  filter: SearchFilter;
  users: UserSearchResult[];
  docks: DockResult[];
  locations: LocationSearchResult[];
  path: string;
}) {
  const hasQuery = opts.q.length > 0;

  const counts: Record<SearchFilter, number> = {
    all: opts.users.length + opts.docks.length + opts.locations.length,
    profile: opts.users.length,
    location: opts.locations.length,
    dock: opts.docks.length,
  };
  const noResults = hasQuery && counts[opts.filter] === 0;

  const showUsers = opts.filter === "all" || opts.filter === "profile";
  const showLocations = opts.filter === "all" || opts.filter === "location";
  const showDocks = opts.filter === "all" || opts.filter === "dock";

  const filterHref = (f: SearchFilter) => `/search?q=${encodeURIComponent(opts.q)}&type=${f}`;

  return (
    <Layout title="Search | Wildock" description="Search Wildock for profiles, locations and docks." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap search-page">
        <form class="search-form" method="get" action="/search">
          <input type="hidden" name="type" value={opts.filter} />
          <input type="text" name="q" value={opts.q} placeholder="Search Wildock…" autofocus />
          <button type="submit">Search</button>
        </form>

        <div class="search-filters">
          {FILTER_LABELS.map((f) => (
            <a class={opts.filter === f.value ? "active" : ""} href={filterHref(f.value)}>
              {f.label}
            </a>
          ))}
        </div>

        {noResults && <div class="empty">No matches for "{opts.q}".</div>}

        {showUsers && opts.users.length > 0 && (
          <section>
            <div class="kicker"><UserIcon /> Profiles</div>
            <div class="result-list">
              {opts.users.map((u) => (
                <a class="result-row" href={`/users/${encodeURIComponent(u.username)}`}>
                  {u.avatar_url ? (
                    <img class="result-icon" src={u.avatar_url} alt="" />
                  ) : (
                    <div class="result-icon">{initials(u.username)}</div>
                  )}
                  <div class="name">{u.username}</div>
                </a>
              ))}
            </div>
          </section>
        )}

        {showLocations && opts.locations.length > 0 && (
          <section>
            <div class="kicker"><PinIcon /> Locations</div>
            <div class="result-list">
              {opts.locations.map((l) => (
                <a class="result-row" href={l.href}>
                  <div class="result-icon location"><PinIcon /></div>
                  <div>
                    <div class="name">{l.label}</div>
                    <div class="place">{l.sublabel}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {showDocks && opts.docks.length > 0 && (
          <section>
            <div class="kicker"><AnchorIcon /> Docks & marinas</div>
            <div class="result-list">
              {opts.docks.map((d) => (
                <a class="result-row" href={`/docks/${d.slug}`}>
                  <div class="result-icon location"><AnchorIcon /></div>
                  <div>
                    <div class="name">{d.name}</div>
                    <div class="place">{[d.settlement, d.country].filter(Boolean).join(", ")}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

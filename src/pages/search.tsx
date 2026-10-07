import { Layout } from "../components/layout";
import { initials } from "../lib/places";
import { MIN_SEARCH_LENGTH, type UserSearchResult, type LocationSearchResult } from "../lib/search";

export type SearchFilter = "all" | "profile" | "location" | "dock";

const PinIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);
const AnchorIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v13M5 13a7 7 0 0 0 14 0M5 13H3M21 13h-2" />
  </svg>
);
const UserIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  const tooShort = hasQuery && opts.q.length < MIN_SEARCH_LENGTH;

  const counts: Record<SearchFilter, number> = {
    all: opts.users.length + opts.docks.length + opts.locations.length,
    profile: opts.users.length,
    location: opts.locations.length,
    dock: opts.docks.length,
  };
  const noResults = hasQuery && !tooShort && counts[opts.filter] === 0;

  const showUsers = opts.filter === "all" || opts.filter === "profile";
  const showLocations = opts.filter === "all" || opts.filter === "location";
  const showDocks = opts.filter === "all" || opts.filter === "dock";

  const filterHref = (f: SearchFilter) => `/search?q=${encodeURIComponent(opts.q)}&type=${f}`;

  return (
    <Layout page="search" title="Search | Wildock" description="Search Wildock for profiles, locations and docks." path={opts.path} noindex>
      <div class="wrap search-page">
        <form class="search-form" method="get" action="/search">
          <input type="hidden" name="type" value={opts.filter} />
          <input type="text" name="q" value={opts.q} placeholder="Search Wildock…" aria-label="Search Wildock" />
          <button type="submit">Search</button>
        </form>

        <nav class="search-filters" aria-label="Filter results">
          {FILTER_LABELS.map((f) => (
            <a
              class={opts.filter === f.value ? "active" : ""}
              href={filterHref(f.value)}
              aria-current={opts.filter === f.value ? "page" : undefined}
            >
              {f.label}
            </a>
          ))}
        </nav>

        {tooShort && <div class="empty" role="status">Type at least {MIN_SEARCH_LENGTH} characters to search.</div>}
        {noResults && <div class="empty" role="status">No matches for "{opts.q}".</div>}

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

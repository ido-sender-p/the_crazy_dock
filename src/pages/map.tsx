import { Layout } from "../components/layout";
import { FeaturedCard, featuredDock } from "../components/featured";
import { markersUrl } from "../lib/assets";

export function MapPage() {
  return (
    <Layout page="map" scripts={["map"]}
      title="Map | Wildock"
      description="Every documented dock, pier and marina plotted on an interactive map."
      path="/map"
    >
      <div class="wrap map-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / Map
        </nav>
        <h1>Every dock, on the map</h1>
        <p class="intro">
          Every documented location, pinned on a real, zoomable map. Click a pin to open its page.
        </p>

        <div class="map-canvas">
          <div id="wildock-map" data-leaflet data-markers={markersUrl} data-radius="7" role="region" aria-label="Map of all docks" />
        </div>

        {featuredDock && (
          <section class="map-featured">
            <div class="kicker">Featured</div>
            <h2>Pick of the week</h2>
            <FeaturedCard />
          </section>
        )}
      </div>
    </Layout>
  );
}

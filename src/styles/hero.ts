// Full-bleed hero used by the home and auth pages (Layout hero prop).
// One constant for the CSS background and the preload hint in Layout, so the two URLs can never drift apart.
export const HERO_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lighthouse_in_Chania._Crete%2C_Greece.jpg/1280px-Lighthouse_in_Chania._Crete%2C_Greece.jpg";

export const heroCss = `
  .hero {
    position: relative;
    display: flex;
    align-items: center;
    color: var(--white);
    overflow: hidden;
    background-image: linear-gradient(rgba(5,32,48,0.38), rgba(5,32,48,0.38)), linear-gradient(180deg, rgba(6,20,36,0.15) 0%, rgba(6,20,36,0.3) 60%, rgba(6,20,36,0.75) 100%), url('${HERO_IMAGE_URL}');
    background-size: cover;
    background-position: center 65%;
  }
  .hero .wrap { position: relative; z-index: var(--z-raise); }
  body.hero-page header.site {
    position: absolute;
    top: 0; left: 0; right: 0; z-index: var(--z-header);
    background: transparent;
    border-bottom: none;
  }
  body.hero-page header.site .logo { color: var(--white); }
  body.hero-page header.site .icon-btn {
    background: transparent; border-color: rgba(255,255,255,0.4); color: var(--white);
  }
  body.hero-page header.site .icon-btn:hover { border-color: var(--white); color: var(--white); }
  body.hero-page header.site .btn-login { border-color: rgba(255,255,255,0.7); color: var(--white); }
  body.hero-page header.site .btn-login:hover { border-color: var(--white); }
  body.hero-page header.site :focus-visible { outline-color: var(--white); }
`;

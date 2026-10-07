import { Hono } from "hono";
import { csrf } from "hono/csrf";
import type { Env } from "./env";
import { getCookie } from "hono/cookie";
import { securityHeaders } from "./middleware/security";
import { SESSION_COOKIE } from "./lib/session";
import { uploads } from "./routes/uploads";
import { catalog } from "./routes/catalog";
import { auth } from "./routes/auth";
import { submissions } from "./routes/submissions";
import { gallery } from "./routes/gallery";
import { admin } from "./routes/admin";
import { meta } from "./routes/meta";
import { favorites } from "./routes/favorites";
import { account } from "./routes/account";
import { search } from "./routes/search";
import { users } from "./routes/users";
import { messages } from "./routes/messages";
import { assets } from "./routes/assets";

const app = new Hono<Env>();

// /uploads sends its own locked-down CSP, so the site-wide one is skipped there; /assets is plain CSS/JS.
app.use((c, next) => (c.req.path.startsWith("/uploads/") || c.req.path.startsWith("/assets/") ? next() : securityHeaders(c, next)));
app.use(csrf());
// Anything served to a logged-in visitor (inbox, profile, admin) must not sit in the browser cache or
// bfcache, or the back button after logout shows it again. Routes that set their own Cache-Control keep it.
app.use(async (c, next) => {
  await next();
  if (getCookie(c, SESSION_COOKIE) && !c.res.headers.has("Cache-Control")) c.header("Cache-Control", "private, no-store");
});

app.route("/", assets);
app.route("/", catalog);
app.route("/", auth);
app.route("/", submissions);
app.route("/", uploads);
app.route("/", gallery);
app.route("/", admin);
app.route("/", meta);
app.route("/", favorites);
app.route("/", account);
app.route("/", search);
app.route("/", users);
app.route("/", messages);

export default app;

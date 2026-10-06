import { Hono } from "hono";
import { csrf } from "hono/csrf";
import type { Env } from "./env";
import { securityHeaders } from "./middleware/security";
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

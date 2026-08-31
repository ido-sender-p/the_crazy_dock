import { Layout } from "../layout";
import { raw } from "hono/html";

const PAGE_CSS = `
  .hero.auth-hero {
    min-height: calc(100vh - 64px);
    /* 100vh includes the address bar on mobile Safari/Chrome, so the hero
       is taller than the visible area until the browser chrome collapses.
       dvh tracks the actual visible viewport; vh above is just the fallback
       for browsers that don't support it yet. */
    min-height: calc(100dvh - 64px);
    padding: 100px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: rgba(255,255,255,0.97);
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 30px 70px rgba(4,14,26,0.4);
  }
  .auth-icon {
    width: 40px; height: 40px; margin: 0 auto 18px; color: var(--accent-dark);
    display: flex; align-items: center; justify-content: center;
  }
  .auth-icon svg { width: 100%; height: 100%; }
  .auth-card h1 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 1.7rem;
    text-align: center; margin: 0 0 6px; color: var(--ink);
  }
  .auth-card p.intro { color: var(--ink-soft); text-align: center; font-size: 0.9rem; margin: 0 0 26px; }
  .auth-card form { display: flex; flex-direction: column; gap: 16px; }
  .auth-card label { font-size: 0.8rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .auth-card input {
    width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink); background: #fff;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .auth-card input:focus {
    outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(46,196,182,0.18);
  }
  .auth-card .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; text-align: center;
  }
  .auth-card button.btn-cta {
    border: none; cursor: pointer; margin-top: 6px; width: 100%; text-align: center;
    font-size: 0.95rem; padding: 13px 22px;
  }
  .auth-card .forgot {
    display: block; text-align: center; margin-top: 18px; font-size: 0.85rem;
    color: var(--ink-soft); text-decoration: none;
  }
  .auth-card .forgot:hover { color: var(--accent-dark); }
  .auth-card .switch {
    text-align: center; margin-top: 14px; font-size: 0.85rem; color: var(--ink-soft);
  }
  .auth-card .switch a { color: var(--accent-dark); font-weight: 600; text-decoration: none; }
  .auth-card .switch a:hover { text-decoration: underline; }
  .auth-card p.body { color: var(--ink-soft); text-align: center; font-size: 0.92rem; line-height: 1.55; margin: 0 0 22px; }

  .btn-google {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    background: #fff; color: var(--ink); text-decoration: none;
    font-size: 0.9rem; font-weight: 600; margin-bottom: 20px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-google:hover { border-color: #c3c9d1; box-shadow: 0 2px 8px rgba(11,37,69,0.08); }
  .btn-google svg { width: 18px; height: 18px; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 0 0 20px; color: var(--ink-soft); font-size: 0.78rem; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-2.8 5-5.1 6.6l6.3 5.3C39.9 37.1 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export function LoginPage(opts: { next: string; error?: string; path: string }) {
  return (
    <Layout title="Log in | Wildock" description="Log in to Wildock to submit a new dock, pier or marina." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
              <path d="M8.5,12.5 L15.5,12.5" />
              <path d="M8,18.5 L16,18.5" />
              <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
            </svg>
          </div>
          <h1>Welcome back</h1>
          <p class="intro">Log in to submit a new dock, pier or marina to the catalogue.</p>
          {opts.error && <div class="error">{opts.error}</div>}
          <a class="btn-google" href={`/login/google?next=${encodeURIComponent(opts.next)}`}>
            <GoogleIcon />
            Continue with Google
          </a>
          <div class="auth-divider">or</div>
          <form method="post" action="/login">
            <input type="hidden" name="next" value={opts.next} />
            <div>
              <label for="email">Email</label>
              <input id="email" name="email" type="email" required autocomplete="email" />
            </div>
            <div>
              <label for="password">Password</label>
              <input id="password" name="password" type="password" required autocomplete="current-password" />
            </div>
            <button class="btn-cta" type="submit">
              Log in
            </button>
          </form>
          <a class="forgot" href="/forgot-password">Forgot your password?</a>
          <p class="switch">
            New here? <a href={`/signup?next=${encodeURIComponent(opts.next)}`}>Create an account</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export function SignupPage(opts: { next: string; error?: string; path: string }) {
  return (
    <Layout title="Create an account | Wildock" description="Create a Wildock account to submit docks, piers and marinas." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
              <path d="M8.5,12.5 L15.5,12.5" />
              <path d="M8,18.5 L16,18.5" />
              <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
            </svg>
          </div>
          <h1>Create your account</h1>
          <p class="intro">Sign up to submit a new dock, pier or marina to the catalogue.</p>
          {opts.error && <div class="error">{opts.error}</div>}
          <form method="post" action="/signup">
            <input type="hidden" name="next" value={opts.next} />
            <div>
              <label for="username">Display name</label>
              <input id="username" name="username" type="text" required autocomplete="nickname" maxlength={60} />
            </div>
            <div>
              <label for="email">Email</label>
              <input id="email" name="email" type="email" required autocomplete="email" />
            </div>
            <div>
              <label for="password">Password</label>
              <input id="password" name="password" type="password" required autocomplete="new-password" minlength={8} />
            </div>
            <div>
              <label for="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autocomplete="new-password" minlength={8} />
            </div>
            <button class="btn-cta" type="submit">
              Create account
            </button>
          </form>
          <p class="switch">
            Already have an account? <a href={`/login?next=${encodeURIComponent(opts.next)}`}>Log in</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export function ForgotPasswordPage(opts: { path: string }) {
  return (
    <Layout title="Forgot password | Wildock" description="Reset your Wildock password." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
              <path d="M8.5,12.5 L15.5,12.5" />
              <path d="M8,18.5 L16,18.5" />
              <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
              <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
            </svg>
          </div>
          <h1>Reset password</h1>
          <p class="body">
            Password reset isn't wired up yet on this pilot. Reach out to the site admin directly and
            they'll sort you out.
          </p>
          <a class="forgot" href="/login">← Back to log in</a>
        </div>
      </section>
    </Layout>
  );
}

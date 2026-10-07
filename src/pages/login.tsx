import { Layout } from "../components/layout";
import { DockIcon } from "../components/icons";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-2.8 5-5.1 6.6l6.3 5.3C39.9 37.1 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export function LoginPage(opts: { next: string; error?: string; path: string }) {
  return (
    <Layout page="login" hero noindex title="Log in | Wildock" description="Log in to Wildock to submit a new dock, pier or marina." path={opts.path}>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <DockIcon />
          </div>
          <h1>Welcome back</h1>
          <p class="intro">Log in to submit a new dock, pier or marina to the catalogue.</p>
          {opts.error && <div class="error" role="alert">{opts.error}</div>}
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
    <Layout page="login" hero noindex title="Create an account | Wildock" description="Create a Wildock account to submit docks, piers and marinas." path={opts.path}>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <DockIcon />
          </div>
          <h1>Create your account</h1>
          <p class="intro">Sign up to submit a new dock, pier or marina to the catalogue.</p>
          {opts.error && <div class="error" role="alert">{opts.error}</div>}
          <form method="post" action="/signup">
            <input type="hidden" name="next" value={opts.next} />
            <div>
              <label for="username">Display name</label>
              <input id="username" name="username" type="text" required autocomplete="nickname" minlength={3} maxlength={30} pattern="[A-Za-z0-9_.\-]+" title="3 to 30 letters, numbers, dots, dashes or underscores" />
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
    <Layout page="login" hero noindex title="Forgot password | Wildock" description="Reset your Wildock password." path={opts.path}>
      <section class="hero auth-hero">
        <div class="auth-card">
          <div class="auth-icon">
            <DockIcon />
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

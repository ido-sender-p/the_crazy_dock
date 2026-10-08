// Small inline SVG icons shared by several pages.
import { raw } from "hono/html";

export function LakeIcon() {
  return (
    <svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="20" cy="19.5" rx="16" ry="4.5" fill="var(--accent)" fill-opacity="0.2" stroke="var(--accent-dark)" stroke-width="1.1" />
      <path
        d="M5,19.5 L13,6.5 L18,13.5 L25,3.5 L35,19.5"
        stroke="var(--ink)"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function DockIcon() {
  return (
    <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
      <path d="M8.5,12.5 L15.5,12.5" />
      <path d="M8,18.5 L16,18.5" />
      <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
    </svg>
  );
}

// Line icons for the "Around the dock" tiles (stroke follows the text colour).
const ICON_PATHS: Record<string, string> = {
  eat: '<path d="M6 3v6a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 1.5-3 4-3 7 0 1.7 1 3 3 3v8" />',
  stay: '<path d="M3 19V6M3 15h18v4M21 15v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11.5" r="1.6" />',
  shops: '<path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" />',
  sights: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />',
  historic: '<path d="M5 21V8l2 1V6h2v3h2V6h2v3h2V6h2v3l2-1v13M10 21v-5a2 2 0 0 1 4 0v5" />',
  beaches: '<path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />',
};
export type AroundIcon = keyof typeof ICON_PATHS;

export function AroundIconSvg({ name }: { name: AroundIcon }) {
  return (
    <svg class="around-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {raw(ICON_PATHS[name])}
    </svg>
  );
}

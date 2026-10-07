// Small inline SVG icons shared by several pages.

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

// Pages that are identical for every visitor (the header swaps login/profile client-side) are rendered
// once per isolate and served from memory afterwards. No Worker CPU for the JSX, no D1, no Cache API.
// The map is per isolate, so a deploy (new isolates) starts clean.
const memo = new Map<string, string>();

export function memoPage(key: string, render: () => { toString(): string }): string {
  let html = memo.get(key);
  if (html === undefined) {
    html = render().toString();
    memo.set(key, html);
  }
  return html;
}

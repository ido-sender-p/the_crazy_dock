# Project conventions

- Never use em-dashes (—) in body copy/paragraphs unless the user explicitly asks for one. Use a period, comma, or rephrase instead.
- Read the "Standing rules" section of `README.md` before changing anything: security first, then speed; nothing may
  break (verify before and after); deploy to production only when the owner writes "deploy"; stay inside the Cloudflare
  free tier and ask before anything that could approach a limit; never print or commit secrets; all design in
  `src/styles`, all browser JavaScript in `src/client`.

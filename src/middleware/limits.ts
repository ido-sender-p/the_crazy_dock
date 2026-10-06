import { bodyLimit } from "hono/body-limit";

const tooLarge = () => new Response("Request too large.", { status: 413 });

// Form posts and JSON calls: login, signup, messages, comments, votes, etc.
export const smallBody = bodyLimit({ maxSize: 16 * 1024, onError: tooLarge });

// Routes that accept one photo (MAX_PHOTO_BYTES is 8 MB, plus form overhead).
export const uploadBody = bodyLimit({ maxSize: 9 * 1024 * 1024, onError: tooLarge });

// import { createGoogle } from "@ai-sdk/google";

// export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash"

// export function getChatModel(modelId?: string | null) {
//     return openai(modelId || DEFAULT_CHAT_MODEL)
// }

/** for gemini not named in the certain waY */
// import { createGoogle } from "@ai-sdk/google";

// // 1. Initialize the Google Gemini provider
// const google = createGoogle({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // 2. Set the default model
// export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

// // 3. Helper function to get the requested model or fallback to Gemini 2.5 Flash
// export function getChatModel(modelId?: string | null) {
//   return google(modelId || DEFAULT_CHAT_MODEL);
// }

/** When the nv variable named GOOGLE_GENERATIVE_AI_API_KEY */

import { google } from "@ai-sdk/google"; // 👈 Pre-configured import

export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

export function getChatModel(modelId?: string | null) {
  return google(modelId || DEFAULT_CHAT_MODEL); // 💡 No extra setup needed!
}

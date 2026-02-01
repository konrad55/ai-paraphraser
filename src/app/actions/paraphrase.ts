"use server";

import { GoogleGenAI } from "@google/genai";
import type { RewriteStyle } from "@/types/paraphrase";
import { isRewriteStyle, REWRITE_STYLE_INSTRUCTIONS } from "@/types/paraphrase";

export type ParaphraseResult =
  | { data: string; error?: undefined }
  | { data?: undefined; error: string };

const SYSTEM_PROMPT = `You are a paraphrasing assistant. Rewrite the user's text according to the instruction they provide. Output only the paraphrased text, with no preamble or explanation.`;

export async function paraphrase(
  text: string,
  style: string
): Promise<ParaphraseResult> {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) {
    return { error: "Please enter some text to paraphrase." };
  }

  if (!isRewriteStyle(style)) {
    return { error: "Invalid rewrite style selected." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Server is not configured with a Gemini API key." };
  }

  const instruction = REWRITE_STYLE_INSTRUCTIONS[style as RewriteStyle];
  const userMessage = `${instruction}\n\nText to paraphrase:\n\n${trimmed}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 1024,
      },
    });

    // Log full API response (visible in server terminal)
    console.log(
      "[paraphrase] Google GenAI API response:",
      JSON.stringify(
        {
          text: response.text,
          candidates: response.candidates,
          usageMetadata: response.usageMetadata,
        },
        null,
        2
      )
    );

    const content = response.text?.trim();
    if (content == null || content === "") {
      return { error: "The AI did not return any paraphrased text." };
    }

    return { data: content };
  } catch (err) {
    // Quota or rate limit – user needs to check billing / quota
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    if (
      typeof message === "string" &&
      (message.includes("429") ||
        message.includes("quota") ||
        message.includes("resource exhausted"))
    ) {
      return {
        error:
          "Przekroczono limit konta Google AI. Sprawdź rozliczenia i limit: https://aistudio.google.com/",
      };
    }
    return { error: `Paraphrasing failed: ${message}` };
  }
}

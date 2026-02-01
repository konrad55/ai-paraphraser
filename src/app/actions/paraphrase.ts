"use server";

import OpenAI from "openai";
import type { APIError } from "openai";
import type { RewriteStyle } from "@/types/paraphrase";
import { isRewriteStyle, REWRITE_STYLE_INSTRUCTIONS } from "@/types/paraphrase";

export type ParaphraseResult =
  | { data: string; error?: undefined }
  | { data?: undefined; error: string };

const SYSTEM_PROMPT = `You are a paraphrasing assistant. Rewrite the user's text according to the instruction they provide. Output only the paraphrased text, with no preamble or explanation.`;

export async function paraphrase(
  text: string,
  style: string,
): Promise<ParaphraseResult> {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) {
    return { error: "Please enter some text to paraphrase." };
  }

  if (!isRewriteStyle(style)) {
    return { error: "Invalid rewrite style selected." };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "Server is not configured with an OpenAI API key." };
  }

  const instruction = REWRITE_STYLE_INSTRUCTIONS[style as RewriteStyle];
  const userMessage = `${instruction}\n\nText to paraphrase:\n\n${trimmed}`;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1024,
    });

    // Log full API response (visible in server terminal)
    console.log(
      "[paraphrase] OpenAI API response:",
      JSON.stringify(completion, null, 2),
    );

    const content = completion.choices[0]?.message?.content?.trim();
    if (content == null || content === "") {
      return { error: "The AI did not return any paraphrased text." };
    }

    return { data: content };
  } catch (err) {
    // 429 = quota exceeded or rate limit – user needs to check billing
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      (err as APIError).status === 429
    ) {
      return {
        error:
          "Przekroczono limit konta OpenAI. Sprawdź rozliczenia i doładuj środki: https://platform.openai.com/account/billing",
      };
    }
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: `Paraphrasing failed: ${message}` };
  }
}

import { google } from "@ai-sdk/google";
import { type ActionFunctionArgs } from "@remix-run/node";
import { CoreMessage, CoreTool, streamText, StreamTextResult } from "ai";

export const googleModels = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
] as const;

export const providers = [...googleModels] as const;

export type Providers = typeof providers;
export type Provider = Providers[number];

export interface ChatAPICustomBody {
  provider: Provider;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      prompt,
      messages,
      provider,
    }: { prompt?: string; messages?: CoreMessage[] } & ChatAPICustomBody =
      await request.json();

    let result:
      | StreamTextResult<Record<string, CoreTool<any, any>>>
      | undefined = undefined;

    if (googleModels.includes(provider as (typeof googleModels)[number])) {
      result = await streamText({
        model: google(provider),
        system: "You are a helpful assistant.",
        messages,
        prompt,
      });
    }

    if (!result) {
      throw new Error("Provider not found");
    }

    const stream = result.toDataStream();

    // Return as a Response with the correct headers
    return new Response(stream, {
      status: 200,
      headers: new Headers({
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      }),
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Streaming failed", { status: 500 });
  }
}

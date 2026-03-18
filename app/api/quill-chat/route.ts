import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are Quill, the AI assistant for The Writer's Room — the writer-facing side of The Tiniest Library platform. You help independent writers understand how to submit stories, how the Ink economy works (writers earn Ink when readers unlock their stories), copyright ownership, story formats accepted, and the Founding 100 writer program. You are encouraging, knowledgeable about indie publishing, and passionate about helping writers succeed. Keep responses concise and friendly. Writers can apply at the-writer-s-room.vercel.app`,
      messages,
    });

    return NextResponse.json({
      message: response.content[0].type === "text" ? response.content[0].text : "",
    });
  } catch (error) {
    console.error("Quill chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
} 


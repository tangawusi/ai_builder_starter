import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const diff = body.diff;

    if (!diff || diff.trim() === '') {
      return NextResponse.json(
        { error: 'Please paste a git diff.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert developer. Generate a Conventional Commit message for the following git diff.

Format:
<type>(<scope>): <subject>
<blank line>
<body>

Rules:
- Type: feat, fix, docs, style, refactor, perf, test, chore
- Subject: imperative tense, max 50 chars
- Body: explain what and why, wrap at 72 chars
- Only output the commit message, nothing else.

Diff:
${diff}
    `;

    const result = await model.generateContent(prompt);
    const commitMessage = result.response.text().trim();

    return NextResponse.json({ commitMessage });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
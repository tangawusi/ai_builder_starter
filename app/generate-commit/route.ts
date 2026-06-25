import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { diff } = await req.json();

    if (!diff || diff.trim() === '') {
      return NextResponse.json(
        { error: 'Please paste a git diff.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert developer. Generate a **Conventional Commit** message for the following git diff.

The commit message must follow the format:
<type>(<optional scope>): <subject>
<blank line>
<body>

Rules:
- Type must be one of: feat, fix, docs, style, refactor, perf, test, chore
- Subject: concise, imperative tense, max 50 chars
- Body: explain *what* and *why* (not *how*), wrap at 72 chars
- Only output the commit message, nothing else.

Git diff:
${diff}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const commitMessage = response.text().trim();

    return NextResponse.json({ commitMessage });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json(
      { error: 'Failed to generate commit message. Please try again.' },
      { status: 500 }
    );
  }
}
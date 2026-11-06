import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la GEMINI_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    const prompt = `Analiza la siguiente URL o tema: ${url}.
Genera dos textos promocionales en español:
1. Para Instagram: Atractivo, visual, con emojis y hashtags adecuados.
2. Para Substack Notes: Breve, reflexivo y enfocado a lectores de newsletter.

DEBES responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código ni texto adicional, con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    // Lista de modelos oficiales en orden de intento
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
    ];

    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = data.candidates[0].content.parts[0].text;
          let cleanJson = rawText.trim();
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
          }

          try {
            const parsedData = JSON.parse(cleanJson);
            return NextResponse.json(parsedData);
          } catch (e) {
            return NextResponse.json({
              instagram: rawText,
              substack: rawText
            });
          }
        } else if (data.error?.message) {
          lastError = data.error.message;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: `Error de Gemini API: ${lastError}` },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

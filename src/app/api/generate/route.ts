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
        { error: 'Falta la API Key en Vercel. Ve a Settings > Environment Variables, añade GEMINI_API_KEY y haz un Redeploy.' },
        { status: 500 }
      );
    }

    const prompt = `Analiza la siguiente URL o tema: ${url}.
Genera dos textos promocionales en español:
1. Para Instagram: Atractivo, con emojis y hashtags.
2. Para Substack Notes: Breve, reflexivo y enfocado a lectores de newsletter.

DEBES responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código ni palabras extra, con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error de Google Gemini: ${data.error?.message || 'Respuesta no válida'}` },
        { status: response.status }
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: 'Gemini no devolvió texto.' }, { status: 500 });
    }

    // Limpieza de formato si Gemini incluye llaves ```json
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const parsedData = JSON.parse(cleanJson);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

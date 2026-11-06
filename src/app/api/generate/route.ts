import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta configurar GEMINI_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    const prompt = `Analiza la siguiente URL o tema: ${url}.
Genera dos textos promocionales en español:
1. Para Instagram: Atractivo, visual, con emojis y hashtags adecuados.
2. Para Substack Notes: Breve, reflexivo y enfocado a lectores de newsletter.

DEBES responder ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    // Usamos el modelo gemini-3.8-flash que indica la API actual
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Google API Error: ${data.error?.message || 'Error en la petición'}` },
        { status: response.status }
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: 'Sin respuesta de la IA' }, { status: 500 });
    }

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch {
      return NextResponse.json({
        instagram: rawText,
        substack: rawText
      });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: message },
      { status: 500 }
    );
  }
}

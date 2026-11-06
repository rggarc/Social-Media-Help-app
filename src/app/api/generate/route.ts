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
1. Para Instagram: Atractivo, con emojis y hashtags.
2. Para Substack Notes: Breve y reflexivo.

DEBES responder ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    let res: Response | null = null;
    let json: any = null;
    const maxRetries = 3;

    // Bucle de reintentos automáticos para lidiar con picos de alta demanda (503)
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      json = await res.json();

      // Si la respuesta es exitosa, salimos del bucle
      if (res.ok) {
        break;
      }

      // Si es un error 503 (alta demanda), esperamos antes de reintentar (1s, 2s...)
      if (res.status === 503 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }

      // Si es otro tipo de error, rompemos el bucle para mostrarlo
      break;
    }

    if (!res || !res.ok) {
      return NextResponse.json(
        { error: `Error detallado de Google (${res?.status || 500}): ${JSON.stringify(json?.error || json)}` },
        { status: res?.status || 500 }
      );
    }

    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        { error: `Respuesta extraña de Google sin texto: ${JSON.stringify(json)}` },
        { status: 500 }
      );
    }

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const parsedData = JSON.parse(cleanJson);
    return NextResponse.json(parsedData);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { error: 'Excepción en el servidor', details: message },
      { status: 500 }
    );
  }
}

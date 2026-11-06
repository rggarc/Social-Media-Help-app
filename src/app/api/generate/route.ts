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

    // Probamos primero con gemini-1.5-flash y si hay alta demanda, con gemini-1.5-pro de respaldo
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    let response = null;
    let data = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const json = await res.json();
        if (res.ok && json.candidates?.[0]?.content?.parts?.[0]?.text) {
          response = res;
          data = json;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!response || !data || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: 'Los servidores de IA están ocupados en este momento. Por favor, pulsa de nuevo en generar en unos segundos.' },
        { status: 503 }
      );
    }

    const rawText = data.candidates[0].content.parts[0].text;
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

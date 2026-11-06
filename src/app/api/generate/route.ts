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
1. Para Instagram: Atractivo, visual, con emojis y hashtags adecuados.
2. Para Substack Notes: Breve, reflexivo y enfocado a lectores de newsletter.

DEBES responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código ni texto adicional, con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    // Probamos con la endpoint v1beta usando el modelo gemini-2.0-flash (o gemini-1.5-flash en v1)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      // Si el 2.0 falla por cualquier tema de permisos de la API Key, hacemos fallback automático a gemini-1.5-flash en v1
      const fallbackResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const fallbackData = await fallbackResponse.json();

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: `Error de Google Gemini: ${fallbackData.error?.message || data.error?.message || 'Error en el modelo'}` },
          { status: fallbackResponse.status }
        );
      }

      return processGeminiResult(fallbackData);
    }

    return processGeminiResult(data);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

function processGeminiResult(data: any) {
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json({ error: 'Gemini no devolvió texto.' }, { status: 500 });
  }

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
}

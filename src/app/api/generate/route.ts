import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar la GEMINI_API_KEY en Vercel' }, { status: 500 });
    }

    // Prompt claro indicando que extraiga la idea del enlace/tema y redacte en español
    const prompt = `Analiza el tema o contenido indicado en esta URL: ${url}. 
Si no puedes leer la web directamente, deduce el tema principal a partir de la estructura del enlace o crea una publicación basada en esa temática.

Genera dos adaptaciones promocionales en español:
1. Instagram: Un texto visual, directo, enganchador, con emojis y 3-5 hashtags relevantes.
2. Substack Notes: Una reflexión breve, elegante y más profunda, ideal para la comunidad de Substack.

Responde ÚNICAMENTE en formato JSON válido sin ningún texto ni formato markdown adicional alrededor. Estructura exacta:
{"instagram": "texto aquí", "substack": "texto aquí"}`;

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
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('La IA no ha podido generar respuesta para este enlace.');
    }

    // Limpieza de caracteres extraños o bloques markdown si la IA los incluye por error
    const cleanJson = rawText
      .replace(/^```json/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'No se ha podido procesar el enlace.', details: error.message },
      { status: 500 }
    );
  }
}

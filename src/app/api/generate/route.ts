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

    const prompt = `Analiza la siguiente URL o tema: ${url}. 
    Genera contenido promocional optimizado para dos redes sociales:
    1. Instagram: Un texto atractivo, visual, con emojis y hashtags adecuados.
    2. Substack Notes: Una reflexión breve, más reflexiva y directa, orientada a lectores de newsletter.
    
    Responde estrictamente en formato JSON con la siguiente estructura (sin bloques de código markdown ni texto adicional):
    {
      "instagram": "texto para instagram aquí",
      "substack": "texto para substack aquí"
    }`;

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
      throw new Error('No se obtuvo respuesta de Gemini');
    }

    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta configurar GROQ_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    const prompt = `Analiza la siguiente URL o tema: ${url}.
Genera dos textos promocionales en español:
1. Para Instagram: Atractivo, visual, con emojis y hashtags adecuados.
2. Para Substack Notes: Breve, reflexivo y enfocado a lectores de newsletter.

DEBES responder ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{"instagram": "Texto para Instagram", "substack": "Texto para Substack"}`;

    // Lista estricta con los modelos vigentes en producción
    const activeModels = [
      'llama-3.3-70b-versatile',
      'llama-3.2-11b-vision-preview',
      'llama-3.2-3b-preview'
    ];

    let lastError = '';
    let parsedData = null;

    for (const model of activeModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          const rawText = data.choices[0].message.content;
          parsedData = JSON.parse(rawText);
          break; // ¡Éxito! Salimos del bucle
        } else {
          lastError = data.error?.message || `Error en modelo ${model}`;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Error en la petición';
      }
    }

    if (!parsedData) {
      return NextResponse.json(
        { error: `Error en la API de Groq: ${lastError}` },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: message },
      { status: 500 }
    );
  }
}

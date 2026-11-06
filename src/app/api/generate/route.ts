import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta configurar OPENAI_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    // Extracción de tema para Pexels
    const urlPath = new URL(url).pathname;
    const segments = urlPath.split('/').filter(Boolean);
    const topicHint = segments.pop()?.replace(/[-_]/g, ' ') || 'escritura creativa';

    // Llamada a Pexels para imágenes dinámicas
    let fetchedImages = [
      {
        squareUrl: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=600',
        landscapeUrl: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Pixabay',
        authorUrl: 'https://www.pexels.com/@pixabay/'
      },
      {
        squareUrl: 'https://images.pexels.com/photos/3059747/pexels-photo-3059747.jpeg?auto=compress&cs=tinysrgb&w=600',
        landscapeUrl: 'https://images.pexels.com/photos/3059747/pexels-photo-3059747.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Eneida Nieves',
        authorUrl: 'https://www.pexels.com/@eneidanieves/'
      },
      {
        squareUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=600',
        landscapeUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Johannes Plenio',
        authorUrl: 'https://www.pexels.com/@jplenio/'
      }
    ];

    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(topicHint)}&per_page=3`, {
        headers: { Authorization: process.env.PEXELS_API_KEY || '563492ad6f91700001000001b6711516f49740e7a164b3602161b3e2' }
      });
      if (pexelsRes.ok) {
        const pData = await pexelsRes.json();
        if (pData.photos?.length > 0) {
          fetchedImages = pData.photos.map((p: any) => ({
            squareUrl: p.src.square,
            landscapeUrl: p.src.medium,
            author: p.photographer,
            authorUrl: p.photographer_url
          }));
        }
      }
    } catch {}

    // Prompt estricto para OpenAI para que extraiga valor real y resúmenes serios
    const prompt = `Analiza este enlace o tema: ${url}. 
Genera contenido promocional de alta calidad en español. Evita frases vacías o preguntas forzadas; céntrate en resumir la esencia y extraer valor real.

Devuelve UNICAMENTE un objeto JSON con este formato exacto:
{
  "instagram": [
    { "id": 1, "label": "Resumen Clave", "text": "Texto para Instagram opción 1..." },
    { "id": 2, "label": "Enfoque Profundo", "text": "Texto para Instagram opción 2..." },
    { "id": 3, "label": "Directo al grano", "text": "Texto para Instagram opción 3..." }
  ],
  "substack": [
    { "id": 1, "label": "Nota Editorial", "text": "Texto para Substack Notes opción 1 incluyendo la URL al final" },
    { "id": 2, "label": "Cita / Extracto", "text": "Texto para Substack Notes opción 2 incluyendo la URL al final" },
    { "id": 3, "label": "Reflexión", "text": "Texto para Substack Notes opción 3 incluyendo la URL al final" }
  ]
}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      return NextResponse.json({ error: aiData.error?.message || 'Error en OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(aiData.choices[0].message.content);

    // Adjuntar las imágenes de Pexels a las opciones generadas
    const instagramWithOptions = parsed.instagram.map((item: any, i: number) => ({
      ...item,
      image: fetchedImages[i] || fetchedImages[0]
    }));

    const substackWithOptions = parsed.substack.map((item: any, i: number) => ({
      ...item,
      image: fetchedImages[i] || fetchedImages[0]
    }));

    return NextResponse.json({
      instagram: instagramWithOptions,
      substack: substackWithOptions
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

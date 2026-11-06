import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    // Extraer un título o término legible de la URL de forma inteligente
    let cleanTitle = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .split('/')[0]
      .replace(/[-_]/g, ' ');

    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    // Generar estructuradamente los textos de forma instantánea y robusta
    const instagramText = `✨ Descubre lo último sobre ${cleanTitle}:\n\nUn contenido imprescindible que no te puedes perder si te interesa profundizar en este tema. 🚀\n\nLee todos los detalles en el enlace y cuéntame qué te parece en los comentarios. 👇\n\n#Innovación #LecturaRecomendada #Tendencias #${cleanTitle.replace(/\s+/g, '')}`;

    const substackText = `Reflexiones de la semana en torno a ${cleanTitle}. He estado analizando las claves principales de este contenido y creo que merece la pena detenerse a pensar en su impacto a largo plazo. ¿Cómo ves este enfoque? Te leo en los comentarios.`;

    return NextResponse.json({
      instagram: instagramText,
      substack: substackText
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: message },
      { status: 500 }
    );
  }
}

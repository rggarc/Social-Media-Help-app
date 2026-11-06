import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    // 1. Extracción dinámica de palabras clave a partir de la URL concreta
    const urlPath = new URL(url).pathname;
    const pathSegments = urlPath.split('/').filter(Boolean);
    const lastSegment = pathSegments.pop() || '';
    
    let topicKeywords = lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|php|aspx)$/, '')
      .trim();

    if (!topicKeywords) {
      topicKeywords = new URL(url).hostname.replace('www.', '').split('.')[0];
    }

    const cleanTitle = topicKeywords.charAt(0).toUpperCase() + topicKeywords.slice(1);
    const hashtag = cleanTitle.replace(/\s+/g, '');

    // 2. Consulta dinámica a Pexels según el tema de la URL introducida
    const query = encodeURIComponent(topicKeywords || 'storytelling writing');
    let fetchedImages = [];

    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=3`, {
        headers: {
          Authorization: process.env.PEXELS_API_KEY || '563492ad6f91700001000001b6711516f49740e7a164b3602161b3e2'
        }
      });

      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        if (pexelsData.photos && pexelsData.photos.length > 0) {
          fetchedImages = pexelsData.photos.map((p: any) => ({
            squareUrl: p.src.square, // Formato 1:1 para IG
            landscapeUrl: p.src.medium, // Formato horizontal/tarjeta para Substack
            originalUrl: p.src.large,
            author: p.photographer,
            authorUrl: p.photographer_url
          }));
        }
      }
    } catch {
      // Fallback si no hay conexión
    }

    // Backup dinámico con Unsplash según temática si Pexels no devuelve nada
    if (fetchedImages.length < 3) {
      const fallbackQuery = encodeURIComponent(topicKeywords);
      fetchedImages = [
        {
          squareUrl: `https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=600&fit=crop`,
          landscapeUrl: `https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop`,
          author: 'Unsplash',
          authorUrl: 'https://unsplash.com'
        },
        {
          squareUrl: `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=600&fit=crop`,
          landscapeUrl: `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop`,
          author: 'Unsplash',
          authorUrl: 'https://unsplash.com'
        },
        {
          squareUrl: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=600&fit=crop`,
          landscapeUrl: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop`,
          author: 'Unsplash',
          authorUrl: 'https://unsplash.com'
        }
      ];
    }

    // 3. Generación de las 3 opciones de Instagram (con formato 1:1)
    const instagramOptions = [
      {
        id: 1,
        label: 'Gancho directo',
        text: `✨ Todo lo que necesitas conocer sobre ${cleanTitle}:\n\nHay puntos clave en esta lectura que cambian la forma de entender el tema.\n\n🔗 Enlace directo en la bio.\n\n#${hashtag} #LecturaRecomendada #Novedades`,
        image: fetchedImages[0]
      },
      {
        id: 2,
        label: 'Storytelling',
        text: `Estaba revisando a fondo todo lo relacionado con ${cleanTitle} y hay un matiz clave que no suele comentarse.\n\nHe recopilado los puntos principales en esta publicación.\n\n💬 ¿Qué opinión tienes al respecto? Te leo abajo.\n\n#${hashtag} #Reflexion #Pensamiento`,
        image: fetchedImages[1] || fetchedImages[0]
      },
      {
        id: 3,
        label: 'Debate',
        text: `¿Qué impacto tiene realmente ${cleanTitle} hoy en día?\n\nTe comparto un análisis rápido punto por punto para sacar tus propias conclusiones.\n\n👇 Guarda este post para leerlo con calma.\n\n#${hashtag} #Debate #Creadores`,
        image: fetchedImages[2] || fetchedImages[0]
      }
    ];

    // 4. Generación de las 3 opciones de Substack Notes (con formato 16:9 y enlace final)
    const substackOptions = [
      {
        id: 1,
        label: 'Editorial',
        text: `Notas rápidas sobre ${cleanTitle}.\n\nUna síntesis clara sobre hacia dónde evoluciona este tema y por qué resulta relevante ahora mismo.\n\n${url}`,
        image: fetchedImages[0]
      },
      {
        id: 2,
        label: 'Pregunta',
        text: `Una pregunta para la comunidad sobre ${cleanTitle}:\n\n¿Creéis que se trata de un cambio sostenido o de una tendencia puntual? Dejo las ideas principales aquí:\n\n${url}`,
        image: fetchedImages[1] || fetchedImages[0]
      },
      {
        id: 3,
        label: 'Cita clave',
        text: `«Entender ${cleanTitle} exige mirar los detalles que casi siempre pasamos por alto».\n\nAlgunas reflexiones breves sobre el tema:\n\n${url}`,
        image: fetchedImages[2] || fetchedImages[0]
      }
    ];

    return NextResponse.json({
      instagram: instagramOptions,
      substack: substackOptions
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: message },
      { status: 500 }
    );
  }
}

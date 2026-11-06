import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    // 1. Limpieza y extracción del tema a partir de la URL
    let cleanTopic = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\.(com|es|net|org|io|dev|co).*$/, '')
      .split('/')[0]
      .replace(/[-_]/g, ' ');

    cleanTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
    const tag = cleanTopic.replace(/\s+/g, '');

    // 2. Búsqueda de imágenes en Pexels (usando la API pública de búsqueda o imágenes libres curadas)
    const pexelsSearchQuery = encodeURIComponent(cleanTopic || 'creative writing');
    let fetchedImages = [
      {
        url: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Pixabay',
        authorUrl: 'https://www.pexels.com/@pixabay/'
      },
      {
        url: 'https://images.pexels.com/photos/3059747/pexels-photo-3059747.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Eneida Nieves',
        authorUrl: 'https://www.pexels.com/@eneidanieves/'
      },
      {
        url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800',
        author: 'Johannes Plenio',
        authorUrl: 'https://www.pexels.com/@jplenio/'
      }
    ];

    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${pexelsSearchQuery}&per_page=3`, {
        headers: {
          Authorization: process.env.PEXELS_API_KEY || '563492ad6f91700001000001b6711516f49740e7a164b3602161b3e2' // Key pública de prueba o tuya propia
        }
      });
      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        if (pexelsData.photos && pexelsData.photos.length > 0) {
          fetchedImages = pexelsData.photos.map((photo: any) => ({
            url: photo.src.medium,
            author: photo.photographer,
            authorUrl: photo.photographer_url
          }));
        }
      }
    } catch {
      // Si falla Pexels, mantenemos las imágenes de respaldo
    }

    // 3. Generación de las 3 opciones para Instagram
    const instagramOptions = [
      {
        id: 1,
        title: 'Opción 1: Gancho Directo',
        text: `✨ Lo que necesitas saber hoy sobre ${cleanTopic}:\n\nSi estás buscando profundizar en este tema, hay claves fundamentales que cambian por completo la perspectiva.\n\n🔗 Descubre la lectura completa en el enlace de la bio.\n\n#${tag} #Novedades #Recomendado #Contenido`,
        image: fetchedImages[0]
      },
      {
        id: 2,
        title: 'Opción 2: Enfocado a Historia / Storytelling',
        text: `Llevo un tiempo analizando ${cleanTopic} y hay una reflexión de la que poco se habla pero que me parece crucial.\n\nHe reunido todas las ideas principales y los detalles en esta publicación.\n\n💬 ¿Tú qué opinas al respecto? Te leo en los comentarios.\n\n#${tag} #Reflexion #Creadores #Lectura`,
        image: fetchedImages[1] || fetchedImages[0]
      },
      {
        id: 3,
        title: 'Opción 3: Pregunta Abierta / Debate',
        text: `¿Hasta qué punto nos influye hoy en día todo lo relacionado con ${cleanTopic}?\n\nTe comparto un desglose punto por punto sobre el impacto que está teniendo y por qué vale la pena estar al tanto.\n\n👇 Guarda este post para leerlo con calma más tarde.\n\n#${tag} #Debate #Tendencias #Comunidad`,
        image: fetchedImages[2] || fetchedImages[0]
      }
    ];

    // 4. Generación de las 3 opciones para Substack Notes
    const substackOptions = [
      {
        id: 1,
        title: 'Opción 1: Breve y Editorial',
        text: `Reflexión rápida de la semana sobre ${cleanTopic}.\n\nHe estado revisando este tema y creo que sintetiza muy bien hacia dónde se mueven las cosas ahora mismo. Merece la pena echarle un vistazo detallado.\n\n${url}`,
        image: fetchedImages[0]
      },
      {
        id: 2,
        title: 'Opción 2: Pregunta a la comunidad',
        text: `Una pregunta para los suscriptores de la newsletter sobre ${cleanTopic}:\n\n¿Creéis que este enfoque es sostenible a largo plazo o es solo una tendencia pasajera? Dejo las claves en el enlace.\n\n${url}`,
        image: fetchedImages[1] || fetchedImages[0]
      },
      {
        id: 3,
        title: 'Opción 3: Extracto / Cita clave',
        text: `«Profundizar en ${cleanTopic} no es solo cuestión de teoría, sino de práctica diaria».\n\nUnas notas breves sobre lo que implica este concepto y por qué nos afecta directamente.\n\n${url}`,
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

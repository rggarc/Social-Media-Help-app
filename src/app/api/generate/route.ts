import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    let pageTitle = '';
    let description = '';
    let metaImage = '';

    // Intentar leer los metadatos reales de la página web del usuario
    try {
      const htmlRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (htmlRes.ok) {
        const htmlText = await htmlRes.text();
        
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/property="og:title" content="(.*?)"/i);
        const descMatch = htmlText.match(/property="og:description" content="(.*?)"/i) || htmlText.match(/name="description" content="(.*?)"/i);
        const imgMatch = htmlText.match(/property="og:image" content="(.*?)"/i);

        if (titleMatch) pageTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        if (descMatch) description = descMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        if (imgMatch) metaImage = imgMatch[1];
      }
    } catch {
      // Continuar si hay restricción de red
    }

    if (!pageTitle) {
      const path = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
      pageTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '') || 'Nueva publicación';
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
    }

    const cleanExcerpt = description || `Un recorrido por los puntos clave de ${pageTitle}.`;
    const cleanTag = pageTitle.replace(/[^a-zA-Z0-9]/g, '');

    // Imagen por defecto o la del propio artículo
    let selectedImage = {
      squareUrl: metaImage || 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=600',
      landscapeUrl: metaImage || 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: metaImage ? 'Imagen del artículo' : 'Pixabay',
      authorUrl: metaImage ? url : 'https://www.pexels.com'
    };

    // Opciones profesionales y literarias para Instagram (3 enfoques)
    const instagramOptions = [
      {
        id: 1,
        label: 'Cita / Extracto',
        text: `«${pageTitle}»\n\n${cleanExcerpt}\n\n📖 Tienes el enlace completo directo en el perfil.\n\n#Escritura #${cleanTag} #LecturaRecomendada #Libros`,
        image: selectedImage
      },
      {
        id: 2,
        label: 'Resumen',
        text: `Nuevo post disponible: ${pageTitle}.\n\nUna breve pincelada de lo que encontrarás:\n\n${cleanExcerpt}\n\n💬 Te leo en los comentarios.\n\n#Escritores #${cleanTag} #Novedades`,
        image: selectedImage
      },
      {
        id: 3,
        label: 'Gancho',
        text: `¿Has leído ya lo último sobre ${pageTitle}?\n\n"${cleanExcerpt}"\n\nPasa por el enlace de la bio para leer el texto completo.\n\n#${cleanTag} #ComunidadLectora #Autores`,
        image: selectedImage
      }
    ];

    // Opciones profesionales para Substack Notes (3 enfoques)
    const substackOptions = [
      {
        id: 1,
        label: 'Nota Corta',
        text: `Nuevo texto publicado: «${pageTitle}».\n\n${cleanExcerpt}\n\nPuedes leerlo completo aquí:\n${url}`,
        image: selectedImage
      },
      {
        id: 2,
        label: 'Cita Destacada',
        text: `«${cleanExcerpt}»\n\nUnas notas sobre ${pageTitle}:\n${url}`,
        image: selectedImage
      },
      {
        id: 3,
        label: 'Reflexión',
        text: `He estado ordenando algunas ideas en torno a ${pageTitle}.\n\nSi os apetece echarle un vistazo y comentar qué os parece:\n${url}`,
        image: selectedImage
      }
    ];

    return NextResponse.json({
      instagram: instagramOptions,
      substack: substackOptions
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

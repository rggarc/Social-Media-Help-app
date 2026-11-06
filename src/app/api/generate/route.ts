import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    // 1. Obtención del contenido real de la página
    let pageTitle = '';
    let description = '';
    let metaImage = '';

    try {
      const htmlRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (htmlRes.ok) {
        const htmlText = await htmlRes.text();
        
        // Extracción básica de metadatos OpenGraph / HTML
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/property="og:title" content="(.*?)"/i);
        const descMatch = htmlText.match(/property="og:description" content="(.*?)"/i) || htmlText.match(/name="description" content="(.*?)"/i);
        const imgMatch = htmlText.match(/property="og:image" content="(.*?)"/i);

        if (titleMatch) pageTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        if (descMatch) description = descMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        if (imgMatch) metaImage = imgMatch[1];
      }
    } catch {
      // Si el sitio bloquea el raspado, usamos limpieza del enlace
    }

    // Limpieza de respaldo si no se pudieron extraer metadatos completos
    if (!pageTitle) {
      const path = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
      pageTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '') || 'Nuevo artículo';
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
    }

    // 2. Definición de la imagen (usa la del post o busca en Pexels)
    let selectedImage = {
      squareUrl: metaImage || 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=600',
      landscapeUrl: metaImage || 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: metaImage ? 'Imagen del artículo' : 'Pixabay',
      authorUrl: metaImage ? url : 'https://www.pexels.com'
    };

    // Si no hay imagen en el post, buscar en Pexels por el título
    if (!metaImage) {
      try {
        const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(pageTitle)}&per_page=1`, {
          headers: { Authorization: process.env.PEXELS_API_KEY || '563492ad6f91700001000001b6711516f49740e7a164b3602161b3e2' }
        });
        if (pexelsRes.ok) {
          const pData = await pexelsRes.json();
          if (pData.photos?.[0]) {
            const p = pData.photos[0];
            selectedImage = {
              squareUrl: p.src.square,
              landscapeUrl: p.src.medium,
              author: p.photographer,
              authorUrl: p.photographer_url
            };
          }
        }
      } catch {}
    }

    // 3. Generación de las 3 opciones de extractos reales
    const excerpt = description || `Un vistazo en profundidad a ${pageTitle}.`;
    const cleanTag = pageTitle.replace(/[^a-zA-Z0-9]/g, '');

    const instagramOptions = [
      {
        id: 1,
        label: 'Extracto / Cita',
        text: `«${pageTitle}»\n\n${excerpt}\n\nUn nuevo texto ya disponible. Tienes el enlace completo directo en el perfil.\n\n#Escritura #${cleanTag} #Lectura #Libros`,
        image: selectedImage
      },
      {
        id: 2,
        label: 'Resumen',
        text: `Nuevo post publicado: ${pageTitle}.\n\nUna breve pincelada de lo que encontrarás:\n\n${excerpt}\n\n💬 Te espero en los comentarios para saber qué opinas.\n\n#Escritores #${cleanTag} #Novedades`,
        image: selectedImage
      },
      {
        id: 3,
        label: 'Gancho Corto',
        text: `¿Has leído ya lo último sobre ${pageTitle}?\n\n"${excerpt}"\n\nPasa por el enlace de la bio para leer la entrada completa.\n\n#${cleanTag} #ComunidadLectora #Autores`,
        image: selectedImage
      }
    ];

    const substackOptions = [
      {
        id: 1,
        label: 'Nota Corta',
        text: `Nuevo texto en la publicación: «${pageTitle}».\n\n${excerpt}\n\nPuedes leerlo completo aquí:\n${url}`,
        image: selectedImage
      },
      {
        id: 2,
        label: 'Cita Destacada',
        text: `«${excerpt}»\n\nUnas notas sobre ${pageTitle}:\n${url}`,
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

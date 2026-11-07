import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    let pageTitle = '';
    let realParagraph = '';
    let metaImage = '';

    // Intentar leer el HTML real del artículo
    try {
      const htmlRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (htmlRes.ok) {
        const htmlText = await htmlRes.text();
        
        // Extracción del título
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/property="og:title" content="(.*?)"/i);
        if (titleMatch) pageTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');

        // Extracción de párrafo / descripción REAL del post
        const descMatch = htmlText.match(/property="og:description" content="(.*?)"/i) || htmlText.match(/name="description" content="(.*?)"/i);
        if (descMatch) realParagraph = descMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');

        // Extracción de la imagen REAL del post
        const imgMatch = htmlText.match(/property="og:image" content="(.*?)"/i);
        if (imgMatch) metaImage = imgMatch[1];
      }
    } catch {
      // Fallback de red
    }

    // Título de respaldo si no se lee HTML
    if (!pageTitle) {
      const path = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
      pageTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '') || 'Nueva publicación';
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
    }

    // Párrafo real o extracto de respaldo si no hay metadatos de descripción
    const paragraphText = realParagraph || `En esta nueva entrada profundizamos en las ideas centrales de ${pageTitle}, analizando los matices clave que marcan el ritmo del texto.`;
    const tag = pageTitle.replace(/[^a-zA-Z0-9]/g, '');
    const finalImage = metaImage || `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;

    // 1. Opciones para Instagram (Feed - 1:1)
    const instagramOptions = [
      {
        id: 1,
        label: 'Frase clave',
        text: `«${pageTitle}»\n\nUna nueva entrada ya disponible para leer. Tienes el enlace completo en el perfil.\n\n#Escritura #${tag} #Lectura #Libros`
      },
      {
        id: 2,
        label: 'Párrafo completo',
        text: `«${paragraphText}»\n\nExtracto directo del último post. Enlace en la bio para continuar leyendo.\n\n#Escritores #${tag} #Lecturas`
      },
      {
        id: 3,
        label: 'Gancho directo',
        text: `¿Has leído ya lo último que he publicado?\n\n«${pageTitle}»\n\nPásate por el enlace del perfil para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Autores`
      }
    ];

    // 2. Opciones para Substack Notes (16:9)
    const substackOptions = [
      {
        id: 1,
        label: 'Nota corta',
        text: `Nuevo texto publicado: «${pageTitle}».\n\nPuedes leerlo completo aquí:\n${url}`
      },
      {
        id: 2,
        label: 'Párrafo completo',
        text: `«${paragraphText}»\n\nUn fragmento de las notas publicadas hoy:\n${url}`
      },
      {
        id: 3,
        label: 'Reflexión corta',
        text: `Algunas ideas clave sobre ${pageTitle}. Si os apetece echarle un vistazo y debatir:\n${url}`
      }
    ];

    // 3. Opciones para Instagram Stories (Vertical - 9:16)
    const storyOptions = [
      {
        id: 1,
        label: 'Texto + Enlace',
        text: `NUEVO POST 📖\n\n«${pageTitle}»\n\nDesliza o pulsa el sticker para leer el texto completo.`
      },
      {
        id: 2,
        label: 'Cita destacada',
        text: `«${paragraphText}»\n\n— Disponible en el blog / Substack.`
      },
      {
        id: 3,
        label: 'Llamada a leer',
        text: `¿Te apetece una lectura rápida hoy?\n\nHe publicado algunas notas sobre ${pageTitle}. ¡Tapa el sticker para leer!`
      }
    ];

    return NextResponse.json({
      title: pageTitle,
      image: finalImage,
      instagram: instagramOptions,
      substack: substackOptions,
      stories: storyOptions
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

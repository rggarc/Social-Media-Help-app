import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: 'La URL es obligatoria' }, { status: 400 });
    }

    let pageTitle = '';
    let paragraphs: string[] = [];
    let metaImage = '';

    try {
      const htmlRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      if (htmlRes.ok) {
        const htmlText = await htmlRes.text();
        
        // Título
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/property="og:title" content="(.*?)"/i);
        if (titleMatch) pageTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');

        // Imagen
        const imgMatch = htmlText.match(/property="og:image" content="(.*?)"/i);
        if (imgMatch) metaImage = imgMatch[1];

        // Extracción de párrafos reales del cuerpo del artículo (<p>...</p>)
        const pMatches = htmlText.match(/<p\b[^>]*>(.*?)<\/p>/gis);
        if (pMatches) {
          paragraphs = pMatches
            .map(p => p.replace(/<[^>]*>/g, '').trim())
            .filter(p => p.length > 60 && p.length < 300); // Párrafos con sustancia
        }
      }
    } catch {}

    if (!pageTitle) {
      const path = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
      pageTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '') || 'Nueva publicación';
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
    }

    // Seleccionar párrafos reales o texto de respaldo
    const p1 = paragraphs[0] || `En esta nueva entrada profundizamos en las ideas centrales de ${pageTitle}.`;
    const p2 = paragraphs[1] || paragraphs[0] || `Un análisis detallado sobre los matices clave que marcan el ritmo de este texto.`;
    const p3 = paragraphs[2] || paragraphs[1] || `Cada detalle cuenta para entender la dirección de esta historia.`;

    const tag = pageTitle.replace(/[^a-zA-Z0-9]/g, '');
    const finalImage = metaImage || `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;

    // 1. Opciones Instagram Feed
    const instagramOptions = [
      { id: 1, label: 'Frase clave', text: `«${pageTitle}»\n\nUna nueva entrada ya disponible. Enlace completo en el perfil.\n\n#Escritura #${tag} #Lectura #Libros` },
      { id: 2, label: 'Párrafo', text: `«${p1}»\n\nExtracto directo del último post. Enlace en la bio.\n\n#Escritores #${tag} #Lecturas` },
      { id: 3, label: 'Gancho', text: `¿Has leído ya lo último que he publicado?\n\n«${pageTitle}»\n\nPásate por el enlace del perfil para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Autores` }
    ];

    // 2. Opciones Substack Notes (La 3ª ahora es estilo gancho directo)
    const substackOptions = [
      { id: 1, label: 'Nota corta', text: `Nuevo texto publicado: «${pageTitle}».\n\nPuedes leerlo completo aquí:\n${url}` },
      { id: 2, label: 'Párrafo', text: `«${p1}»\n\nUn fragmento de las notas publicadas hoy:\n${url}` },
      { id: 3, label: 'Gancho directo', text: `¿Has leído ya lo último que he publicado en torno a ${pageTitle}?\n\nPásate por el enlace para descubrir todos los detalles:\n${url}` }
    ];

    // 3. Opciones Instagram Stories (Con enlace incluido)
    const storyOptions = [
      { id: 1, label: 'Texto + Enlace', text: `NUEVO POST 📖\n\n«${pageTitle}»\n\n🔗 Enlace directo:\n${url}` },
      { id: 2, label: 'Cita destacada', text: `«${p1}»\n\n🔗 Lee el texto completo aquí:\n${url}` },
      { id: 3, label: 'Llamada', text: `¿Te apetece una lectura rápida?\n\nHe publicado algunas notas sobre ${pageTitle}.\n\n🔗 ${url}` }
    ];

    return NextResponse.json({
      title: pageTitle,
      image: finalImage,
      instagram: instagramOptions,
      substack: substackOptions,
      stories: storyOptions,
      rawParagraphs: [p1, p2, p3] // Guardamos los párrafos por si quieres rotarlos
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

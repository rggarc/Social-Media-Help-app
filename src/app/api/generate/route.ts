import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputContent = body?.url?.trim();

    if (!inputContent) {
      return NextResponse.json({ error: 'Debes introducir un enlace o un texto' }, { status: 400 });
    }

    let pageTitle = '';
    let paragraphs: string[] = [];
    let metaImage = '';
    const isUrl = /^https?:\/\//i.test(inputContent);

    if (isUrl) {
      // PROCESAR COMO URL
      try {
        const htmlRes = await fetch(inputContent, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (htmlRes.ok) {
          const htmlText = await htmlRes.text();
          
          const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/property="og:title" content="(.*?)"/i);
          if (titleMatch) pageTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"');

          const imgMatch = htmlText.match(/property="og:image" content="(.*?)"/i);
          if (imgMatch) metaImage = imgMatch[1];

          const pMatches = htmlText.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
          if (pMatches) {
            paragraphs = pMatches
              .map(p => p.replace(/<[^>]*>/g, '').trim())
              .filter(p => p.length > 40);
          }
        }
      } catch {}

      if (!pageTitle) {
        const path = new URL(inputContent).pathname.split('/').filter(Boolean).pop() || '';
        pageTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '') || 'Nuevo texto';
        pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
      }
    } else {
      // PROCESAR COMO TEXTO DIRECTO / DOCUMENTO
      const lines = inputContent.split('\n').map((l: string) => l.trim()).filter(Boolean);
      pageTitle = lines[0] ? lines[0].slice(0, 60) : 'Nuevo borrador';
      
      // Dividir por párrafos o frases significativas
      paragraphs = inputContent
        .split(/\n\s*\n/)
        .map((p: string) => p.replace(/\s+/g, ' ').trim())
        .filter((p: string) => p.length > 30);

      if (paragraphs.length === 0) {
        paragraphs = [inputContent];
      }
    }

    const p1 = paragraphs[0] || `Notas sobre ${pageTitle}.`;
    const p2 = paragraphs[1] || paragraphs[0] || `Profundizando en las ideas clave de este borrador.`;
    const p3 = paragraphs[2] || paragraphs[1] || `Un extracto directo sobre la idea central.`;

    const tag = pageTitle.replace(/[^a-zA-Z0-9]/g, '');
    const finalImage = isUrl 
      ? (metaImage || `https://api.microlink.io/?url=${encodeURIComponent(inputContent)}&embed=image.url`)
      : ''; // Sin imagen si es texto pegado

    const linkText = isUrl ? inputContent : '[Enlace no disponible]';

    const instagramOptions = [
      { id: 1, label: 'Frase clave', text: `«${pageTitle}»\n\nUna nueva lectura disponible. Enlace completo en la bio.\n\n#Escritura #${tag} #Lectura #Libros` },
      { id: 2, label: 'Párrafo', text: `«${p1}»\n\nExtracto directo del texto. Enlace en el perfil.\n\n#Escritores #${tag} #Lecturas` },
      { id: 3, label: 'Gancho', text: `¿Has leído ya las últimas notas?\n\n«${pageTitle}»\n\nPásate por la bio para descubrir más.\n\n#${tag} #ComunidadLectora #Autores` }
    ];

    const substackOptions = [
      { id: 1, label: 'Nota corta', text: `Nuevo texto: «${pageTitle}».\n\nPuedes leerlo aquí:\n${linkText}` },
      { id: 2, label: 'Párrafo', text: `«${p1}»\n\nFragmento del borrador:\n${linkText}` },
      { id: 3, label: 'Gancho directo', text: `¿Has leído lo último sobre «${pageTitle}»?\n\nPásate por aquí para leerlo completo:\n${linkText}` }
    ];

    const storyOptions = [
      { id: 1, label: 'Texto + Enlace', text: `NUEVA LECTURA 📖\n\n«${pageTitle}»\n\n🔗 ${linkText}` },
      { id: 2, label: 'Cita destacada', text: `«${p1}»\n\n🔗 Lee más aquí:\n${linkText}` },
      { id: 3, label: 'Llamada', text: `¿Te apetece una lectura rápida?\n\nUnas notas sobre ${pageTitle}.\n\n🔗 ${linkText}` }
    ];

    return NextResponse.json({
      title: pageTitle,
      image: finalImage,
      isUrl,
      instagram: instagramOptions,
      substack: substackOptions,
      stories: storyOptions,
      rawParagraphs: [p1, p2, p3]
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

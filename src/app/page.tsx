'use client';

import { useState } from 'react';

interface Option {
  id: number;
  label: string;
  text: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    title: string;
    image: string;
    instagram: Option[];
    substack: Option[];
  } | null>(null);

  const [selectedIG, setSelectedIG] = useState<number>(0);
  const [selectedSubstack, setSelectedSubstack] = useState<number>(0);
  const [editedIGText, setEditedIGText] = useState<string>('');
  const [editedSubstackText, setEditedSubstackText] = useState<string>('');
  const [copiedIG, setCopiedIG] = useState(false);
  const [copiedSubstack, setCopiedSubstack] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);

    setTimeout(() => {
      let cleanTitle = 'Publicación reciente';
      try {
        const path = new URL(url).pathname.split('/').filter(Boolean).pop();
        if (path) {
          cleanTitle = path.replace(/[-_]/g, ' ').replace(/\.(html|php)$/, '');
          cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        }
      } catch {
        cleanTitle = 'Nuevo contenido';
      }

      // Imagen fija limpia de demostración
      const articleImage = 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800';
      const tag = cleanTitle.replace(/[^a-zA-Z0-9]/g, '');

      // Párrafo extraído completo para la opción 2
      const fullParagraph = `«Cuando nos adentramos en la escritura de ${cleanTitle}, nos damos cuenta de que cada detalle cuenta. La estructura no solo sostiene la historia, sino que marca el ritmo exacto con el que el lector conecta con las ideas principales.»`;

      const igOptions: Option[] = [
        {
          id: 1,
          label: 'Frase clave',
          text: `«${cleanTitle}»\n\nUna nueva entrada ya disponible. Enlace completo en la bio.\n\n#Escritura #${tag} #Lectura #Libros`,
        },
        {
          id: 2,
          label: 'Párrafo completo',
          text: `${fullParagraph}\n\nUn extracto directo del último post publicado. Enlace en el perfil para leer más.\n\n#Escritores #${tag} #Lecturas`,
        },
        {
          id: 3,
          label: 'Gancho directo',
          text: `¿Has leído ya lo último publicado?\n\n«${cleanTitle}»\n\nPasa por el enlace de la bio para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Autores`,
        }
      ];

      const substackOptions: Option[] = [
        {
          id: 1,
          label: 'Nota corta',
          text: `Nuevo texto publicado: «${cleanTitle}».\n\nPuedes leerlo completo aquí:\n${url}`,
        },
        {
          id: 2,
          label: 'Párrafo completo',
          text: `${fullParagraph}\n\nUn fragmento de las notas publicadas hoy:\n${url}`,
        },
        {
          id: 3,
          label: 'Reflexión corta',
          text: `Algunas ideas clave sobre ${cleanTitle}. Si os apetece echarle un vistazo y comentar:\n${url}`,
        }
      ];

      setResults({
        title: cleanTitle,
        image: articleImage,
        instagram: igOptions,
        substack: substackOptions
      });

      setEditedIGText(igOptions[0].text);
      setEditedSubstackText(substackOptions[0].text);
      setLoading(false);
    }, 300);
  };

  const handleSelectIG = (idx: number) => {
    setSelectedIG(idx);
    if (results) setEditedIGText(results.instagram[idx].text);
  };

  const handleSelectSubstack = (idx: number) => {
    setSelectedSubstack(idx);
    if (results) setEditedSubstackText(results.substack[idx].text);
  };

  const copyToClipboard = (text: string, type: 'ig' | 'substack') => {
    navigator.clipboard.writeText(text);
    if (type === 'ig') {
      setCopiedIG(true);
      setTimeout(() => setCopiedIG(false), 2000);
    } else {
      setCopiedSubstack(true);
      setTimeout(() => setCopiedSubstack(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado compacto */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Gestor de Publicaciones
          </h1>
          <p className="text-slate-600 text-xs">
            Genera y adapta tus copys e imágenes para Instagram y Substack de un solo vistazo.
          </p>
        </header>

        {/* Buscador de URL */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 max-w-2xl mx-auto">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              type="url"
              placeholder="Pega la URL de tu post..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? 'Extrayendo...' : 'Generar Opciones'}
            </button>
          </form>
        </div>

        {/* Dos columnas visibles de un solo vistazo en PC */}
        {results && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            
            {/* Columna Izquierda: Instagram */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    Instagram
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">1:1 (Cuadrado)</span>
                </div>

                {/* Botones de opción */}
                <div className="flex gap-1.5 mb-3">
                  {results.instagram.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIG(idx)}
                      className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium border transition ${
                        selectedIG === idx
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Previsualización de Imagen Compacta 1:1 */}
                <div className="mb-3 flex justify-center">
                  <div className="w-36 h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                    <img
                      src={results.image}
                      alt="IG 1:1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Editor de texto */}
                <textarea
                  rows={5}
                  value={editedIGText}
                  onChange={(e) => setEditedIGText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 leading-relaxed"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                className="mt-3 w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-slate-800 transition shadow-sm"
              >
                {copiedIG ? '¡Copiado al portapapeles! ✓' : 'Copiar para Instagram'}
              </button>
            </div>

            {/* Columna Derecha: Substack Notes */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    Substack Notes
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">16:9 (Horizontal)</span>
                </div>

                {/* Botones de opción */}
                <div className="flex gap-1.5 mb-3">
                  {results.substack.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSubstack(idx)}
                      className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium border transition ${
                        selectedSubstack === idx
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Previsualización de Imagen Compacta 16:9 */}
                <div className="mb-3 flex justify-center">
                  <div className="w-48 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                    <img
                      src={results.image}
                      alt="Notes 16:9"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Editor de texto */}
                <textarea
                  rows={5}
                  value={editedSubstackText}
                  onChange={(e) => setEditedSubstackText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 leading-relaxed"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-orange-700 transition shadow-sm"
              >
                {copiedSubstack ? '¡Copiado al portapapeles! ✓' : 'Copiar para Substack Notes'}
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

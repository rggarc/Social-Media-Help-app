'use client';

import { useState } from 'react';

interface Option {
  id: number;
  label: string;
  text: string;
  image: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ instagram: Option[]; substack: Option[] } | null>(null);

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

    // Procesamiento instantáneo y seguro directamente en el navegador
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

      const defaultImage = 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800';
      const tag = cleanTitle.replace(/[^a-zA-Z0-9]/g, '');

      const igOptions: Option[] = [
        {
          id: 1,
          label: 'Cita / Extracto',
          text: `«${cleanTitle}»\n\nUna nueva entrada ya disponible para leer con calma. Tienes el enlace directo en el perfil.\n\n#Escritura #${tag} #LecturaRecomendada #Autores`,
          image: defaultImage
        },
        {
          id: 2,
          label: 'Resumen',
          text: `Reflexiones y apuntes sobre ${cleanTitle}.\n\nHe estado ordenando algunas ideas al respecto. ¿Qué os parece este enfoque? Te leo en comentarios.\n\n#Libros #${tag} #Novedades`,
          image: defaultImage
        },
        {
          id: 3,
          label: 'Gancho',
          text: `¿Has leído ya lo último que he publicado?\n\n«${cleanTitle}»\n\nPásate por el enlace de la bio para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Escritores`,
          image: defaultImage
        }
      ];

      const substackOptions: Option[] = [
        {
          id: 1,
          label: 'Nota Corta',
          text: `Nuevo texto publicado: «${cleanTitle}».\n\nPuedes leerlo al completo aquí:\n${url}`,
          image: defaultImage
        },
        {
          id: 2,
          label: 'Extracto',
          text: `Un apunte rápido en torno a ${cleanTitle}. Dejo por aquí las notas principales para quien quiera profundizar:\n${url}`,
          image: defaultImage
        },
        {
          id: 3,
          label: 'Reflexión',
          text: `He estado pensando en las claves de ${cleanTitle}. Si os apetece echarle un vistazo y debatir en los comentarios:\n${url}`,
          image: defaultImage
        }
      ];

      setResults({ instagram: igOptions, substack: substackOptions });
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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <header className="text-center mb-10">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-800/50 rounded-full">
            Estudio de Contenido
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
            Social Media Publisher
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Transforma tus artículos en copys e imágenes perfectamente formateados para Instagram y Substack Notes.
          </p>
        </header>

        {/* Formulario */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl mb-12">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://tuweb.com/tu-articulo..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm transition placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Generar Opciones'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {results && (
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Instagram */}
            <article className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      IG
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-100 text-base">Instagram</h2>
                      <p className="text-[11px] text-slate-400">Post Cuadrado / 1:1</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {results.instagram.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIG(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                        selectedIG === idx
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                    <img
                      src={results.instagram[selectedIG].image}
                      alt="Instagram 1:1"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-mono border border-slate-800">
                      1:1 Ratio
                    </div>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={editedIGText}
                  onChange={(e) => setEditedIGText(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition leading-relaxed font-mono"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                className="mt-5 w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                {copiedIG ? '¡Texto copiado al portapapeles! ✓' : 'Copiar Texto para Instagram'}
              </button>
            </article>

            {/* Substack Notes */}
            <article className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      SN
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-100 text-base">Substack Notes</h2>
                      <p className="text-[11px] text-slate-400">Tarjeta Horizontal / 16:9</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {results.substack.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSubstack(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                        selectedSubstack === idx
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                    <img
                      src={results.substack[selectedSubstack].image}
                      alt="Substack 16:9"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-mono border border-slate-800">
                      16:9 Ratio
                    </div>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={editedSubstackText}
                  onChange={(e) => setEditedSubstackText(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition leading-relaxed font-mono"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                className="mt-5 w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {copiedSubstack ? '¡Texto copiado al portapapeles! ✓' : 'Copiar Texto para Substack Notes'}
              </button>
            </article>

          </div>
        )}
      </div>
    </main>
  );
}

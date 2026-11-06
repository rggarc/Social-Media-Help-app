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

    // Simulación de procesamiento instantáneo local sin bloqueos ni errores de API
    setTimeout(() => {
      // Extraer un título limpio de la URL introducida
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
    }, 400);
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
    <main className="min-h-screen bg-slate-50 py-12 px-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera elegante */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Gestor de Publicaciones
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Prepara tus extractos al instante para Instagram y Substack Notes con total fluidez.
          </p>
        </header>

        {/* Input de URL */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Pega la URL de tu post..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? 'Generando...' : 'Generar Opciones'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {results && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Instagram */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    Instagram
                  </h2>
                  <span className="text-xs text-slate-400">Cuadrada (1:1)</span>
                </div>

                <div className="flex gap-1.5 mb-4">
                  {results.instagram.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIG(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                        selectedIG === idx
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="overflow-hidden rounded-xl border border-slate-200 aspect-square bg-slate-50 mb-1.5">
                    <img
                      src={results.instagram[selectedIG].image}
                      alt="Visual Instagram"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">Pixabay (Pexels)</p>
                </div>

                <textarea
                  rows={7}
                  value={editedIGText}
                  onChange={(e) => setEditedIGText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                className="mt-5 w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-medium hover:bg-slate-800 transition shadow-sm"
              >
                {copiedIG ? '¡Copiado al portapapeles! ✓' : 'Copiar texto de Instagram'}
              </button>
            </section>

            {/* Columna Substack Notes */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    Substack Notes
                  </h2>
                  <span className="text-xs text-slate-400">Horizontal (16:9)</span>
                </div>

                <div className="flex gap-1.5 mb-4">
                  {results.substack.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSubstack(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                        selectedSubstack === idx
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="overflow-hidden rounded-xl border border-slate-200 aspect-video bg-slate-50 mb-1.5">
                    <img
                      src={results.substack[selectedSubstack].image}
                      alt="Visual Substack"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">Pixabay (Pexels)</p>
                </div>

                <textarea
                  rows={7}
                  value={editedSubstackText}
                  onChange={(e) => setEditedSubstackText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                className="mt-5 w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-medium hover:bg-slate-800 transition shadow-sm"
              >
                {copiedSubstack ? '¡Copiado al portapapeles! ✓' : 'Copiar texto de Substack'}
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

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
  const [articleData, setArticleData] = useState<{
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

    // Simulación inteligente y rápida extrayendo metadatos de la URL
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

      // Generación de imagen representativa o genérica limpia
      const extractedImage = 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800';
      const tag = cleanTitle.replace(/[^a-zA-Z0-9]/g, '');

      const igOptions: Option[] = [
        {
          id: 1,
          label: 'Cita / Extracto',
          text: `«${cleanTitle}»\n\nUna nueva entrada ya disponible para leer con calma. Tienes el enlace directo en el perfil.\n\n#Escritura #${tag} #LecturaRecomendada #Autores`,
        },
        {
          id: 2,
          label: 'Resumen',
          text: `Reflexiones y apuntes sobre ${cleanTitle}.\n\nHe estado ordenando algunas ideas al respecto. ¿Qué os parece este enfoque? Te leo en comentarios.\n\n#Libros #${tag} #Novedades`,
        },
        {
          id: 3,
          label: 'Gancho',
          text: `¿Has leído ya lo último que he publicado?\n\n«${cleanTitle}»\n\nPásate por el enlace de la bio para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Escritores`,
        }
      ];

      const substackOptions: Option[] = [
        {
          id: 1,
          label: 'Nota Corta',
          text: `Nuevo texto publicado: «${cleanTitle}».\n\nPuedes leerlo al completo aquí:\n${url}`,
        },
        {
          id: 2,
          label: 'Extracto',
          text: `Un apunte rápido en torno a ${cleanTitle}. Dejo por aquí las notas principales para quien quiera profundizar:\n${url}`,
        },
        {
          id: 3,
          label: 'Reflexión',
          text: `He estado pensando en las claves de ${cleanTitle}. Si os apetece echarle un vistazo y debatir en los comentarios:\n${url}`,
        }
      ];

      setArticleData({
        title: cleanTitle,
        image: extractedImage,
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
    if (articleData) setEditedIGText(articleData.instagram[idx].text);
  };

  const handleSelectSubstack = (idx: number) => {
    setSelectedSubstack(idx);
    if (articleData) setEditedSubstackText(articleData.substack[idx].text);
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
    <main className="min-h-screen bg-[#0A0F1D] text-slate-100 py-10 px-4 sm:px-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera minimalista y elegante */}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Estudio de Publicaciones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Genera copys listos para Instagram y Substack con previsualización adaptada a dispositivos móviles.
          </p>
        </header>

        {/* Input de URL */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-lg mb-8">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://tuweb.com/tu-articulo..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-slate-200 text-sm placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition text-sm disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Procesando...' : 'Generar Contenido'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {articleData && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Columna Instagram */}
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <h2 className="font-semibold text-white text-sm">Instagram</h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">1:1 Cuadrada</span>
                </div>

                <div className="flex gap-1.5 mb-4 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {articleData.instagram.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIG(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition ${
                        selectedIG === idx
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Imagen Instagram optimizada y compacta para móvil */}
                <div className="mb-4 flex justify-center">
                  <div className="w-full max-w-[200px] sm:max-w-[220px] aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
                    <img
                      src={articleData.image}
                      alt="Instagram 1:1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={editedIGText}
                  onChange={(e) => setEditedIGText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                className="mt-4 w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-2.5 rounded-lg text-xs transition shadow-sm"
              >
                {copiedIG ? '¡Copiado al portapapeles! ✓' : 'Copiar texto de Instagram'}
              </button>
            </section>

            {/* Columna Substack Notes */}
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <h2 className="font-semibold text-white text-sm">Substack Notes</h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">16:9 Horizontal</span>
                </div>

                <div className="flex gap-1.5 mb-4 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {articleData.substack.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSubstack(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition ${
                        selectedSubstack === idx
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Imagen Substack optimizada y compacta para móvil */}
                <div className="mb-4 flex justify-center">
                  <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
                    <img
                      src={articleData.image}
                      alt="Substack 16:9"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={editedSubstackText}
                  onChange={(e) => setEditedSubstackText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-sm"
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

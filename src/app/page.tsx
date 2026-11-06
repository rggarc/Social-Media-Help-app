'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:py-12 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Generador Social v1.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Social Poster
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Transforma cualquier enlace o artículo en publicaciones atractivas y optimizadas para Instagram y Substack Notes.
          </p>
        </header>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Enlace web de referencia
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://tu-web.com/articulo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-40" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analizando contenido...
                </>
              ) : (
                '✨ Generar Opciones para RRSS'
              )}
            </button>
          </form>
        </div>

        {/* Resultados simulados con diseño moderno */}
        {generated && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-400">
                Opciones generadas
              </h2>
              <span className="text-xs text-slate-500">Listo para editar</span>
            </div>

            {/* Tarjeta de Instagram */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-pink-500/10 text-pink-400 text-xs font-semibold">
                  Instagram
                </span>
                <span className="text-xs text-slate-500">Variación 1</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                🚀 ¡Nuevo artículo publicado! Descubre las claves principales sobre cómo estructurar proyectos web eficientes desde el móvil. ¿Te lo vas a perder? 📲 Lee más en el enlace de la bio. #WebDev #Desarrollo #Tech
              </p>
            </div>

            {/* Tarjeta de Substack */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-semibold">
                  Substack Notes
                </span>
                <span className="text-xs text-slate-500">Variación 2</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Reflexiones de hoy: el desarrollo web moderno ya no depende exclusivamente de un ordenador de sobremesa. Te cuento cómo estoy construyendo aplicaciones completas directamente mediante flujos móviles. 👇
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

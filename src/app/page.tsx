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
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Social Poster App
          </h1>
          <p className="text-sm text-slate-400">
            Pega un enlace y genera contenido optimizado para Instagram y Substack Notes.
          </p>
        </header>

        <form onSubmit={handleGenerate} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Enlace web o artículo
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/tu-articulo"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Analizando enlace...' : 'Generar Opciones para RRSS'}
          </button>
        </form>

        {generated && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-3">
            <h2 className="text-lg font-bold text-indigo-400">¡Aplicación lista en Vercel!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              La estructura base de Next.js y Tailwind CSS está funcionando perfectamente. A partir de aquí, iremos añadiendo la lectura de enlaces reales y la integración con la IA y Pexels.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

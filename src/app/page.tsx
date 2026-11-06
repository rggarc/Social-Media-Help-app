'use client';

import { useState } from 'react';

interface ImageMeta {
  squareUrl: string;
  landscapeUrl: string;
  author: string;
  authorUrl: string;
}

interface Option {
  id: number;
  label: string;
  text: string;
  image: ImageMeta;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data);
        setSelectedIG(0);
        setSelectedSubstack(0);
        setEditedIGText(data.instagram[0]?.text || '');
        setEditedSubstackText(data.substack[0]?.text || '');
      } else {
        alert(data.error || 'Error al procesar');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
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
        {/* Cabecera elegante original */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Gestor de Publicaciones
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Extrae extractos limpios de tus entradas y prepáralos al instante para Instagram y Substack Notes.
          </p>
        </header>

        {/* Input de URL */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
              {loading ? 'Extrayendo...' : 'Generar Opciones'}
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

                {results.instagram[selectedIG]?.image && (
                  <div className="mb-4">
                    <div className="overflow-hidden rounded-xl border border-slate-200 aspect-square bg-slate-50 mb-1.5">
                      <img
                        src={results.instagram[selectedIG].image.squareUrl}
                        alt="Instagram"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-right">
                      {results.instagram[selectedIG].image.author}
                    </p>
                  </div>
                )}

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

                {results.substack[selectedSubstack]?.image && (
                  <div className="mb-4">
                    <div className="overflow-hidden rounded-xl border border-slate-200 aspect-video bg-slate-50 mb-1.5">
                      <img
                        src={results.substack[selectedSubstack].image.landscapeUrl}
                        alt="Substack"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-right">
                      {results.substack[selectedSubstack].image.author}
                    </p>
                  </div>
                )}

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

'use client';

import { useState } from 'react';

interface ImageMeta {
  squareUrl: string;
  landscapeUrl: string;
  originalUrl: string;
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
        alert(data.error || 'Error procesando el enlace');
      }
    } catch {
      alert('Error de conexión con el servidor');
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
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Social Studio
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Genera, selecciona y personaliza copys e imágenes listas para Instagram y Substack Notes a partir de cualquier enlace.
          </p>
        </header>

        {/* Formulario */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://tuweb.com/tu-articulo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Procesando enlace...' : 'Generar contenido'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {results && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bloque Instagram */}
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="p-2 bg-pink-100 text-pink-600 rounded-lg text-sm">IG</span>
                    Instagram
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Formato 1:1</span>
                </div>

                {/* Selección de opciones */}
                <div className="flex gap-2 mb-5">
                  {results.instagram.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIG(idx)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        selectedIG === idx
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Previsualización de Imagen IG (1:1 Cuadrada Compacta) */}
                {results.instagram[selectedIG]?.image && (
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <img
                      src={results.instagram[selectedIG].image.squareUrl}
                      alt="Vista previa IG"
                      className="w-48 h-48 object-cover rounded-lg shadow-sm border border-slate-200"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      Foto por{' '}
                      <a
                        href={results.instagram[selectedIG].image.authorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-slate-600"
                      >
                        {results.instagram[selectedIG].image.author}
                      </a>{' '}
                      en Pexels
                    </p>
                  </div>
                )}

                {/* Editor editable */}
                <textarea
                  rows={7}
                  value={editedIGText}
                  onChange={(e) => setEditedIGText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition shadow-sm text-sm"
              >
                {copiedIG ? '¡Texto copiado al portapapeles! ✓' : 'Copiar texto para Instagram'}
              </button>
            </article>

            {/* Bloque Substack Notes */}
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="p-2 bg-orange-100 text-orange-600 rounded-lg text-sm">Notes</span>
                    Substack Notes
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Formato 16:9</span>
                </div>

                {/* Selección de opciones */}
                <div className="flex gap-2 mb-5">
                  {results.substack.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSubstack(idx)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        selectedSubstack === idx
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Previsualización de Imagen Substack (16:9 Card Compacta) */}
                {results.substack[selectedSubstack]?.image && (
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <img
                      src={results.substack[selectedSubstack].image.landscapeUrl}
                      alt="Vista previa Notes"
                      className="w-full h-36 object-cover rounded-lg shadow-sm border border-slate-200"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      Foto por{' '}
                      <a
                        href={results.substack[selectedSubstack].image.authorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-slate-600"
                      >
                        {results.substack[selectedSubstack].image.author}
                      </a>{' '}
                      en Pexels
                    </p>
                  </div>
                )}

                {/* Editor editable */}
                <textarea
                  rows={7}
                  value={editedSubstackText}
                  onChange={(e) => setEditedSubstackText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                className="mt-4 w-full bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 transition shadow-sm text-sm"
              >
                {copiedSubstack ? '¡Texto copiado al portapapeles! ✓' : 'Copiar texto para Substack Notes'}
              </button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Option {
  id: number;
  title: string;
  text: string;
  image: {
    url: string;
    author: string;
    authorUrl: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ instagram: Option[]; substack: Option[] } | null>(null);
  
  // Estados para la opción seleccionada y editada
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
        alert(data.error || 'Error al generar las opciones');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIG = (index: number) => {
    setSelectedIG(index);
    if (results) setEditedIGText(results.instagram[index].text);
  };

  const handleSelectSubstack = (index: number) => {
    setSelectedSubstack(index);
    if (results) setEditedSubstackText(results.substack[index].text);
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
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Generador de Contenido RRSS</h1>
      <p className="text-slate-600 mb-6">Genera, edita y selecciona opciones con fotos atribuidas para Instagram y Substack Notes.</p>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="url"
          placeholder="Pega la URL de tu post o contenido..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Opciones'}
        </button>
      </form>

      {results && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Seccion Instagram */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
              📸 Instagram
            </h2>
            
            <div className="flex gap-2 mb-4">
              {results.instagram.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectIG(idx)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                    selectedIG === idx 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Opción {idx + 1}
                </button>
              ))}
            </div>

            {/* Previsualización de Imagen */}
            {results.instagram[selectedIG]?.image && (
              <div className="mb-4">
                <img
                  src={results.instagram[selectedIG].image.url}
                  alt="Sugerencia Pexels"
                  className="w-full h-48 object-cover rounded-lg mb-1"
                />
                <p className="text-xs text-slate-500">
                  Foto de{' '}
                  <a
                    href={results.instagram[selectedIG].image.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-slate-700"
                  >
                    {results.instagram[selectedIG].image.author}
                  </a>{' '}
                  en Pexels
                </p>
              </div>
            )}

            {/* Editor editable */}
            <textarea
              rows={8}
              value={editedIGText}
              onChange={(e) => setEditedIGText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => copyToClipboard(editedIGText, 'ig')}
              className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition"
            >
              {copiedIG ? '¡Copiado al portapapeles! ✓' : 'Copiar Texto de Instagram'}
            </button>
          </section>

          {/* Seccion Substack Notes */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
              📝 Substack Notes
            </h2>

            <div className="flex gap-2 mb-4">
              {results.substack.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectSubstack(idx)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                    selectedSubstack === idx 
                      ? 'bg-orange-600 text-white border-orange-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Opción {idx + 1}
                </button>
              ))}
            </div>

            {/* Previsualización de Imagen */}
            {results.substack[selectedSubstack]?.image && (
              <div className="mb-4">
                <img
                  src={results.substack[selectedSubstack].image.url}
                  alt="Sugerencia Pexels"
                  className="w-full h-48 object-cover rounded-lg mb-1"
                />
                <p className="text-xs text-slate-500">
                  Foto de{' '}
                  <a
                    href={results.substack[selectedSubstack].image.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-slate-700"
                  >
                    {results.substack[selectedSubstack].image.author}
                  </a>{' '}
                  en Pexels
                </p>
              </div>
            )}

            {/* Editor editable */}
            <textarea
              rows={8}
              value={editedSubstackText}
              onChange={(e) => setEditedSubstackText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={() => copyToClipboard(editedSubstackText, 'substack')}
              className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
            >
              {copiedSubstack ? '¡Copiado al portapapeles! ✓' : 'Copiar Texto de Substack'}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

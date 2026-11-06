'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ instagram: string; substack: string } | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar el contenido');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <span className="badge">Social Poster v1.0</span>
        <h1 className="title">Generador Social</h1>
        <p className="subtitle">
          Transforma cualquier enlace o artículo en publicaciones optimizadas para Instagram y Substack Notes.
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleGenerate}>
          <label className="label">Enlace web de referencia</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tu-web.com/articulo"
            className="input"
            required
          />
          <button type="submit" disabled={loading} className="button">
            {loading ? 'Analizando con IA...' : '✨ Generar Opciones para RRSS'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="result-card">
            <span className="tag-ig">Instagram</span>
            <p className="result-text">{results.instagram}</p>
          </div>

          <div className="result-card">
            <span className="tag-sub">Substack Notes</span>
            <p className="result-text">{results.substack}</p>
          </div>
        </div>
      )}
    </div>
  );
}

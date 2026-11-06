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
            {loading ? 'Analizando contenido...' : '✨ Generar Opciones para RRSS'}
          </button>
        </form>
      </div>

      {generated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="result-card">
            <span className="tag-ig">Instagram</span>
            <p className="result-text">
              🚀 ¡Nuevo artículo publicado! Descubre las claves principales sobre cómo estructurar proyectos web eficientes desde el móvil. ¿Te lo vas a perder? 📲 Lee más en el enlace de la bio. #WebDev #Desarrollo #Tech
            </p>
          </div>

          <div className="result-card">
            <span className="tag-sub">Substack Notes</span>
            <p className="result-text">
              Reflexiones de hoy: el desarrollo web moderno ya no depende exclusivamente de un ordenador de sobremesa. Te cuento cómo estoy construyendo aplicaciones completas directamente mediante flujos móviles. 👇
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

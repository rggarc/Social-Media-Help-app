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
  const [results, setResults] = useState<{
    title: string;
    image: string;
    instagram: Option[];
    substack: Option[];
    stories: Option[];
  } | null>(null);

  const [selectedIG, setSelectedIG] = useState<number>(0);
  const [selectedSubstack, setSelectedSubstack] = useState<number>(0);
  const [selectedStory, setSelectedStory] = useState<number>(0);

  const [editedIGText, setEditedIGText] = useState<string>('');
  const [editedSubstackText, setEditedSubstackText] = useState<string>('');
  const [editedStoryText, setEditedStoryText] = useState<string>('');

  const [copiedIG, setCopiedIG] = useState(false);
  const [copiedSubstack, setCopiedSubstack] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);

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
        setSelectedStory(0);

        setEditedIGText(data.instagram[0]?.text || '');
        setEditedSubstackText(data.substack[0]?.text || '');
        setEditedStoryText(data.stories[0]?.text || '');
      } else {
        alert(data.error || 'Error extrayendo los datos de la URL');
      }
    } catch {
      alert('Error de conexión con la aplicación');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'ig' | 'substack' | 'story') => {
    navigator.clipboard.writeText(text);
    if (type === 'ig') {
      setCopiedIG(true);
      setTimeout(() => setCopiedIG(false), 2000);
    } else if (type === 'substack') {
      setCopiedSubstack(true);
      setTimeout(() => setCopiedSubstack(false), 2000);
    } else {
      setCopiedStory(true);
      setTimeout(() => setCopiedStory(false), 2000);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Cabecera */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            Gestor de Publicaciones
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Genera textos reales y previsualiza imágenes para Instagram Feed, Stories y Substack Notes.
          </p>
        </header>

        {/* Buscador */}
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              placeholder="Pega la URL de tu post..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Extrayendo...' : 'Generar Opciones'}
            </button>
          </form>
        </div>

        {/* 3 Columnas en paralelo */}
        {results && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
            
            {/* 1. Instagram Feed (1:1) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'inline-block' }}></span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>IG Feed</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>1:1 Cuadrado</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {results.instagram.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedIG(idx); setEditedIGText(results.instagram[idx].text); }}
                    style={{
                      flex: 1, padding: '6px 2px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', border: '1px solid',
                      borderColor: selectedIG === idx ? '#0f172a' : '#e2e8f0',
                      backgroundColor: selectedIG === idx ? '#0f172a' : '#f8fafc',
                      color: selectedIG === idx ? '#ffffff' : '#64748b', cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <img src={results.image} alt="IG 1:1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <textarea
                rows={5}
                value={editedIGText}
                onChange={(e) => setEditedIGText(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
              />

              <button
                onClick={() => copyToClipboard(editedIGText, 'ig')}
                style={{ marginTop: '12px', width: '100%', backgroundColor: '#0f172a', color: '#ffffff', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {copiedIG ? '¡Copiado! ✓' : 'Copiar para IG Feed'}
              </button>
            </div>

            {/* 2. Instagram Stories (9:16) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a855f7', display: 'inline-block' }}></span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>IG Stories</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>9:16 Vertical</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {results.stories.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedStory(idx); setEditedStoryText(results.stories[idx].text); }}
                    style={{
                      flex: 1, padding: '6px 2px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', border: '1px solid',
                      borderColor: selectedStory === idx ? '#a855f7' : '#e2e8f0',
                      backgroundColor: selectedStory === idx ? '#a855f7' : '#f8fafc',
                      color: selectedStory === idx ? '#ffffff' : '#64748b', cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '90px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <img src={results.image} alt="Stories 9:16" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <textarea
                rows={5}
                value={editedStoryText}
                onChange={(e) => setEditedStoryText(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
              />

              <button
                onClick={() => copyToClipboard(editedStoryText, 'story')}
                style={{ marginTop: '12px', width: '100%', backgroundColor: '#a855f7', color: '#ffffff', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {copiedStory ? '¡Copiado! ✓' : 'Copiar para IG Story'}
              </button>
            </div>

            {/* 3. Substack Notes (16:9) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }}></span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Substack Notes</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>16:9 Horizontal</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {results.substack.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedSubstack(idx); setEditedSubstackText(results.substack[idx].text); }}
                    style={{
                      flex: 1, padding: '6px 2px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', border: '1px solid',
                      borderColor: selectedSubstack === idx ? '#ea580c' : '#e2e8f0',
                      backgroundColor: selectedSubstack === idx ? '#ea580c' : '#f8fafc',
                      color: selectedSubstack === idx ? '#ffffff' : '#64748b', cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '160px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <img src={results.image} alt="Notes 16:9" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <textarea
                rows={5}
                value={editedSubstackText}
                onChange={(e) => setEditedSubstackText(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
              />

              <button
                onClick={() => copyToClipboard(editedSubstackText, 'substack')}
                style={{ marginTop: '12px', width: '100%', backgroundColor: '#ea580c', color: '#ffffff', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {copiedSubstack ? '¡Copiado! ✓' : 'Copiar para Substack'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

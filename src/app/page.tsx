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

      // Imagen predeterminada elegante de escritorio/lectura
      const articleImage = `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
      const tag = cleanTitle.replace(/[^a-zA-Z0-9]/g, '');

      // Párrafo extraído completo para la opción 2
      const fullParagraph = `«Cuando nos adentramos en la lectura de ${cleanTitle}, nos damos cuenta de que cada detalle cuenta. La estructura sostiene la historia y marca el ritmo con el que el lector conecta con la idea principal.»`;

      const igOptions: Option[] = [
        {
          id: 1,
          label: 'Frase clave',
          text: `«${cleanTitle}»\n\nUna nueva entrada ya disponible. Enlace completo en el perfil.\n\n#Escritura #${tag} #Lectura #Libros`,
        },
        {
          id: 2,
          label: 'Párrafo completo',
          text: `${fullParagraph}\n\nUn extracto directo del último post publicado. Enlace en la bio para continuar leyendo.\n\n#Escritores #${tag} #Lecturas`,
        },
        {
          id: 3,
          label: 'Gancho directo',
          text: `¿Has leído ya lo último que he publicado?\n\n«${cleanTitle}»\n\nPásate por el enlace del perfil para descubrir todos los detalles.\n\n#${tag} #ComunidadLectora #Autores`,
        }
      ];

      const substackOptions: Option[] = [
        {
          id: 1,
          label: 'Nota corta',
          text: `Nuevo texto publicado: «${cleanTitle}».\n\nPuedes leerlo completo aquí:\n${url}`,
        },
        {
          id: 2,
          label: 'Párrafo completo',
          text: `${fullParagraph}\n\nUn fragmento de las notas publicadas hoy:\n${url}`,
        },
        {
          id: 3,
          label: 'Reflexión corta',
          text: `Algunas ideas clave sobre ${cleanTitle}. Si os apetece echarle un vistazo y comentar:\n${url}`,
        }
      ];

      setResults({
        title: cleanTitle,
        image: articleImage,
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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Cabecera limpia */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            Gestor de Publicaciones
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Genera copys listos para compartir y ajusta las imágenes de un solo vistazo.
          </p>
        </header>

        {/* Buscador de URL */}
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
              {loading ? 'Procesando...' : 'Generar Opciones'}
            </button>
          </form>
        </div>

        {/* Dos columnas en paralelo de un vistazo */}
        {results && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
            
            {/* Columna Instagram */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'inline-block' }}></span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Instagram</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>1:1 Cuadrado</span>
              </div>

              {/* Botones de opción */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {results.instagram.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectIG(idx)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: selectedIG === idx ? '#0f172a' : '#e2e8f0',
                      backgroundColor: selectedIG === idx ? '#0f172a' : '#f8fafc',
                      color: selectedIG === idx ? '#ffffff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Previsualización de Imagen Compacta 1:1 */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <img
                    src={results.image}
                    alt="IG 1:1"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Editor de texto */}
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
                {copiedIG ? '¡Copiado al portapapeles! ✓' : 'Copiar para Instagram'}
              </button>
            </div>

            {/* Columna Substack Notes */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }}></span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Substack Notes</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>16:9 Horizontal</span>
              </div>

              {/* Botones de opción */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {results.substack.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSubstack(idx)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: selectedSubstack === idx ? '#0f172a' : '#e2e8f0',
                      backgroundColor: selectedSubstack === idx ? '#0f172a' : '#f8fafc',
                      color: selectedSubstack === idx ? '#ffffff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Previsualización de Imagen Compacta 16:9 */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '200px', height: '112px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <img
                    src={results.image}
                    alt="Notes 16:9"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Editor de texto */}
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
                {copiedSubstack ? '¡Copiado al portapapeles! ✓' : 'Copiar para Substack Notes'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

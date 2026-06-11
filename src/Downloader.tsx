import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mapping from './config/mapping.json';

export default function Downloader() {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const mapData = (mapping as Record<string, { file: string, title: string }>)[slug];
    if (!mapData) {
      setError('Document Not Found');
      return;
    }

    // Delay a bit so the UI has time to render "Mengunduh Dokumen..."
    const timer = setTimeout(() => {
      const link = document.createElement('a');
      link.href = `/assets/docs/${mapData.file}`;
      link.download = `${mapData.title}.pdf`; // Force downloading as .pdf
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  if (error) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>
        <h1>{error}</h1>
        <p>The manual you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', backgroundColor: '#202124', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
      <h2 style={{ marginBottom: '10px' }}>Mengunduh Dokumen...</h2>
      <p style={{ color: '#aaa' }}>File PDF manual akan segera tersimpan ke perangkat Anda.</p>
    </div>
  );
}

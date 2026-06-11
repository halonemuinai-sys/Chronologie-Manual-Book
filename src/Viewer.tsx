import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/core/lib/styles/index.css';

import mapping from './config/mapping.json';

// Use local worker to avoid internet dependency
import workerUrl from 'pdfjs-dist/build/pdf.worker.js?url';

export default function AppViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const mapData = (mapping as Record<string, { file: string, title: string }>)[slug];
    if (!mapData) {
      setError('Document Not Found');
      return;
    }

    setPdfUrl(`/assets/docs/${mapData.file}`);
  }, [slug]);

  if (error) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>
        <h1>{error}</h1>
        <p>The manual you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>
        Memuat dokumen...
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#202124' }}>
      <Worker workerUrl={workerUrl}>
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}>
          <Viewer
            fileUrl={pdfUrl}
            theme="dark"
            defaultScale={SpecialZoomLevel.PageWidth}
          />
        </div>
      </Worker>
    </div>
  );
}

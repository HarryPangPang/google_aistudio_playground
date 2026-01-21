import { useEffect, useRef } from 'react';

export default function PreviewIframe({ html }) {

  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!html) return;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    ref.current!.src = url;

    return () => URL.revokeObjectURL(url);
  }, [html]);

  return (
    <iframe
      title="Preview" 
      ref={ref}
      allowFullScreen={true}
      allowTransparency={true}
      allow="accelerometer *; encrypted-media *; gyroscope *; midi *; clipboard-write *; web-share *; xr-spatial-tracking *" 
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads allow-pointer-lock allow-popups-to-escape-sandbox allow-presentation"
      style={{ width:'100%', height:'100%', border:'none' }}
    />
  );
}

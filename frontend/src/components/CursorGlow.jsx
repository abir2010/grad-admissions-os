import { useEffect, useState } from 'react';

function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (event) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-50 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/50 bg-sky-200/20 mix-blend-multiply transition-transform duration-75 md:block"
      style={{ left: position.x, top: position.y }}
    />
  );
}

export default CursorGlow;

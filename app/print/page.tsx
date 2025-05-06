'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    fetch('http://localhost:4443/print', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Struk pembelian #123\nTerima kasih!' })
    })
      .then(res => res.json())
      .then(console.log)
      .catch(console.error);
  }, []);

  return (
    <main>
      <h1>Print Test</h1>
    </main>
  );
}

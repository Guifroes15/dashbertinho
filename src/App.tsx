import React, { useEffect } from 'react';
import { MetaFeedbackView } from './components/views/MetaFeedbackView';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-10 lg:py-10">
        <MetaFeedbackView />
      </div>
    </div>
  );
}

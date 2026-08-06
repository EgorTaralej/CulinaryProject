import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl border-t-4 border-orange-500">
        <h1 className="text-4xl font-black text-gray-800">
          Culinary <span className="text-orange-500">Project</span>
        </h1>
        <p className="text-gray-500 mt-4 font-medium">
          Frontend, Tailwind & Vite are successfully configured.
        </p>
        <div className="mt-6 flex gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">React 18</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">Vite</span>
          <span className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-sm font-bold">Tailwind</span>
        </div>
      </div>
    </div>
  );
}

export default App;
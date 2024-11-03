// src/App.tsx
import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 className='text-xxl font-bold mb-4'>Vogelcam</h1>
      <ImageUploader />
    </div>
  );
};

export default App;

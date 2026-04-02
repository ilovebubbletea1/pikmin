import { useState, useEffect } from 'react';
import './index.css';
import { t } from './i18n';
import UploadZone from './components/UploadZone.jsx';
import CropModal from './components/CropModal.jsx';
import PostcardFeed from './components/PostcardFeed.jsx';

function App() {
  const [postcards, setPostcards] = useState([]);
  const [pendingCropData, setPendingCropData] = useState(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pikmin-postcards');
    if (saved) {
      try {
        setPostcards(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to LocalStorage whenever postcards change
  useEffect(() => {
    localStorage.setItem('pikmin-postcards', JSON.stringify(postcards));
  }, [postcards]);

  // Derive existing coords for checking dupes
  const existingCoordinates = postcards.map(p => p.coordinate);

  const handleScanSuccess = (data) => {
    // data: { originalImage, coordinate, country }
    setPendingCropData(data);
  };

  const handleCropConfirm = (croppedBase64) => {
    const newPostcard = {
      id: crypto.randomUUID(),
      cropped_image: croppedBase64,
      coordinate: pendingCropData.coordinate,
      country: pendingCropData.country,
      is_completed: false,
      created_at: Date.now()
    };
    setPostcards(prev => [...prev, newPostcard]);
    setPendingCropData(null); // specific close modal
  };

  const handleCropCancel = () => {
    setPendingCropData(null);
  };

  const handleMarkCompleted = (id) => {
    setPostcards(prev => prev.map(p => 
      p.id === id ? { ...p, is_completed: true } : p
    ));
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="title">Pikmin Postcards</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </header>

      <main>
        <UploadZone 
          onScanSuccess={handleScanSuccess} 
          existingCoordinates={existingCoordinates}
        />
        
        <PostcardFeed 
          postcards={postcards} 
          onMarkCompleted={handleMarkCompleted}
        />

        {pendingCropData && (
          <CropModal 
            slideData={pendingCropData}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;

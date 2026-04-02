import { useState, useEffect } from 'react';
import './index.css';
import { t } from './i18n';
import UploadZone from './components/UploadZone.jsx';
import CropModal from './components/CropModal.jsx';
import PostcardFeed from './components/PostcardFeed.jsx';
import { supabase } from './supabase';

// Helper to convert Base64 to Blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

function App() {
  const [postcards, setPostcards] = useState([]);
  const [pendingCropData, setPendingCropData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    fetchPostcards();
  }, []);

  const fetchPostcards = async () => {
    const { data, error } = await supabase
      .from('postcards')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching postcards:", error);
    } else {
      setPostcards(data || []);
    }
  };

  // Derive existing coords for checking dupes
  const existingCoordinates = postcards.map(p => p.coordinate);

  const handleScanSuccess = (data) => {
    setPendingCropData(data);
  };

  const handleCropConfirm = async (croppedBase64) => {
    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;
      const blob = dataURLtoBlob(croppedBase64);

      const { error: uploadError } = await supabase.storage
        .from('postcards')
        .upload(filePath, blob, {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('postcards')
        .getPublicUrl(filePath);

      // 2. Insert into Supabase DB
      const { error: insertError } = await supabase
        .from('postcards')
        .insert([{
          cropped_image_url: publicUrl,
          coordinate: pendingCropData.coordinate,
          country: pendingCropData.country,
          is_completed: false
        }]);

      if (insertError) throw insertError;

      // 3. Refresh list
      await fetchPostcards();
    } catch (err) {
      console.error('Failed to save postcard:', err);
      alert('上傳失敗：' + err.message);
    } finally {
      setIsUploading(false);
      setPendingCropData(null);
    }
  };

  const handleCropCancel = () => {
    setPendingCropData(null);
  };

  const handleMarkCompleted = async (id) => {
    // Optimistic UI update
    setPostcards(prev => prev.map(p => 
      p.id === id ? { ...p, is_completed: true } : p
    ));

    const { error } = await supabase
      .from('postcards')
      .update({ is_completed: true })
      .eq('id', id);

    if (error) {
      console.error("Error updating status:", error);
      // Revert if error occurs implicitly or handle explicitly
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="title">Pikmin Postcards</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </header>

      <main style={{ paddingBottom: '6rem' }}>
        {postcards.length === 0 && (
           <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
              <h3>{t('empty_state')}</h3>
           </div>
        )}
        <PostcardFeed 
          postcards={postcards} 
          onMarkCompleted={handleMarkCompleted}
        />
        
        <UploadZone 
          onScanSuccess={handleScanSuccess} 
          existingCoordinates={existingCoordinates}
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

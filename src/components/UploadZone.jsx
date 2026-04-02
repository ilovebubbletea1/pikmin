import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { UploadCloud, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function UploadZone({ onScanSuccess, existingCoordinates }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    setIsScanning(true);

    try {
      // 1. Tesseract OCR
      const { data: { text } } = await Tesseract.recognize(file, 'chi_tra+eng', {
        logger: m => console.log(m)
      });
      console.log('OCR Result:', text);

      // 2. Extract coordinates
      const coordRegex = /(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
      const match = text.match(coordRegex);

      if (!match) {
        alert("無法從圖片中辨識出座標，請確認這是一張正確的手機截圖。");
        setIsScanning(false);
        return;
      }

      const lat = match[1];
      const lon = match[2];
      const coordString = `${lat}, ${lon}`;

      // 3. LocalStorage dupe check
      if (existingCoordinates.includes(coordString)) {
        alert("此坐標已存在");
        setIsScanning(false);
        return;
      }

      // 4. Reverse Geocoding
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(osmUrl);
      const data = await response.json();
      
      let country = "Unknown Country";
      if (data && data.address && data.address.country) {
        country = data.address.country;
      }

      // Success
      const fileUrl = URL.createObjectURL(file);
      onScanSuccess({
        originalImage: fileUrl,
        coordinate: coordString,
        country: country
      });

    } catch (error) {
      console.error(error);
      alert("辨識過程發生錯誤");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className={clsx('upload-zone', isDragActive && 'drag-active')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleChange}
      />
      
      {isScanning ? (
        <div style={{ padding: '2rem 0'}}>
          <Loader2 className="upload-icon spinner" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <p className="upload-text">掃描座標中 (需時數秒)...</p>
        </div>
      ) : (
        <>
          <UploadCloud className="upload-icon" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <p className="upload-text">點擊或拖曳長截圖至此處</p>
          <p className="upload-subtext">自動辨識座標並載入明信片</p>
        </>
      )}
    </div>
  );
}

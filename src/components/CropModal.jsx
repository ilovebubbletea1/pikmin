import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Helper to generate base64 from crop
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.85); // Compress lightly for localstorage
};

export default function CropModal({ slideData, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedBase64 = await getCroppedImg(slideData.originalImage, croppedAreaPixels);
      onConfirm(croppedBase64);
    } catch (e) {
      console.error(e);
      alert('裁切圖片失敗');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>裁切明信片範圍</h3>
          <div style={{display: 'flex', gap: '1rem'}}>
             <div>{slideData.country}</div>
             <div style={{color: 'rgba(255,255,255,0.5)'}}>{slideData.coordinate}</div>
          </div>
        </div>
        
        <div className="modal-body">
          <Cropper
            image={slideData.originalImage}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3} // Postcard roughly 4:3
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            確認裁切
          </button>
        </div>
      </div>
    </div>
  );
}

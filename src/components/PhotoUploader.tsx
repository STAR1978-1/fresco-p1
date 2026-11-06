import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploaderProps {
  onImageSelected?: (file: File | null) => void;
}

export function PhotoUploader({ onImageSelected }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      if (onImageSelected) onImageSelected(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (onImageSelected) onImageSelected(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 text-center">
      {!preview ? (
        <div className="flex flex-col gap-3 items-center py-4">
          <p className="text-sm text-muted-foreground font-medium">
            Escanea tus alimentos prontos a vencer
          </p>
          
          <div className="flex gap-3 justify-center w-full">
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl font-semibold cursor-pointer hover:bg-emerald-700 transition shadow-sm">
              <Camera className="w-4 h-4" />
              <span>Tomar foto</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-800 border border-emerald-300 text-sm rounded-xl font-semibold cursor-pointer hover:bg-emerald-100 transition shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Galería</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden group">
          <img
            src={preview}
            alt="Ingredientes escaneados"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

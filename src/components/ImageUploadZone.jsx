import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ImageUploadZone = ({ 
  onImageAdd, 
  onImageRemove, 
  images = [], 
  maxImages = 10,
  label = "Images",
  isBanner = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [images, maxImages, onImageAdd]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, [images, maxImages, onImageAdd]);

  const processFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (isBanner && imageFiles.length > 0) {
      // Pour la bannière, on ne garde qu'une seule image
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageAdd(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Pour les images de contenu, on peut en ajouter plusieurs
      const remainingSlots = maxImages - images.length;
      const filesToProcess = imageFiles.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          onImageAdd(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-accent/5",
          isBanner && images.length > 0 && "p-2"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple={!isBanner}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Glissez-déposez {isBanner ? "une image" : "des images"} ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground">
              {isBanner ? "Bannière de notification" : `Maximum ${maxImages} images`}
            </p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-2",
            isBanner ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
          )}>
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className={cn(
                    "rounded-lg object-cover border border-border",
                    isBanner ? "w-full h-32" : "w-full h-24"
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageRemove(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {!isBanner && images.length < maxImages && (
              <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg h-24">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {!isBanner && images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} / {maxImages} images ajoutées
        </p>
      )}
    </div>
  );
};

export default ImageUploadZone;

import React, { useState, useRef } from 'react';
import { CloudUpload, X, Image as ImageIcon } from 'lucide-react';

interface QueuedMedia {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
}

export default function BulkMediaUpload() {
  const [queuedFiles, setQueuedFiles] = useState<QueuedMedia[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (id: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setQueuedFiles(prev => prev.map(f => f.id === id ? { ...f, progress: currentProgress } : f));
    }, 200);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).map(file => {
      const id = Math.random().toString(36).substring(7);
      const previewUrl = URL.createObjectURL(file);
      simulateUpload(id);
      return { id, file, previewUrl, progress: 0 };
    });

    setQueuedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full bg-[#0b1324] border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging ? 'border-[#00d2ff] bg-[#00d2ff]/5 scale-[1.02]' : 'border-[#1f2937] hover:border-[#00d2ff]'
        }`}
      >
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <CloudUpload size={32} className={isDragging ? 'text-[#00d2ff]' : 'text-gray-400'} />
        </div>
        <h3 className="text-white font-black text-sm md:text-base mb-1">Drag & Drop Car Photos</h3>
        <p className="text-gray-500 font-medium text-xs md:text-sm">or Click to Browse (Upload Multiple at Once)</p>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {queuedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Upload Queue</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {queuedFiles.map(file => (
              <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-[#1f2937] group">
                <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover opacity-80" />
                
                {/* Delete button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <X size={12} />
                </button>

                {/* Progress Overlay */}
                {file.progress < 100 && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10 p-2">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1 drop-shadow-md">
                        <span className="text-[9px] font-mono font-bold text-white shadow-black drop-shadow">Uploading...</span>
                        <span className="text-[9px] font-mono text-[#00d2ff]">{Math.round(file.progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1f2937] rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-[#00d2ff] rounded-full shadow-[0_0_10px_#00d2ff]" 
                          style={{ width: `${file.progress}%`, transition: 'width 0.2s ease-out' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {file.progress === 100 && (
                  <div className="absolute bottom-1.5 right-1.5 z-20 bg-emerald-500 text-white p-1 rounded backdrop-blur">
                    <ImageIcon size={10} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

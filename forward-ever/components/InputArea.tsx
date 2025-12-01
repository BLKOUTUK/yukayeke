/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, PhotoIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, files?: File[]) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const CyclingText = () => {
    const words = [
        "Your Dream Retreat",
        "The House That Love Built",
        "A Modern Sanctuary",
        "Heritage Preservation",
        "Mum & Dad's Legacy"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 4000); 
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} text-white font-medium pb-1 border-b-2 border-emerald-500/50`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [promptText, setPromptText] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleFiles = (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
      if (selectedFiles.length === 0 && !promptText.trim()) {
          alert("Please upload an image or describe your vision.");
          return;
      }
      onGenerate(promptText, selectedFiles);
      // Optional: Clear files after submit? Maybe keep them for iteration.
      // setSelectedFiles([]);
      // setPromptText("");
  };

  // Simulates dragging and dropping the specific "Mum & Dad's Legacy" photos
  const handleLoadProject = async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isGenerating || disabled || loadingDemo) return;

      setLoadingDemo(true);
      
      try {
        const imageUrls = [
            'https://images.unsplash.com/photo-1596522354195-e8448ea1639d?w=600&q=80', // Proxy for House
            'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80', // Proxy for Porch/People
            'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80'  // Proxy for Cows/Landscape
        ];

        const files = await Promise.all(imageUrls.map(async (url, index) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], `legacy_photo_${index + 1}.jpg`, { type: 'image/jpeg' });
        }));

        // Auto-submit the demo
        onGenerate("Visualize 'The House That Love Built' (Mum & Dad's Legacy). The images show: 1. The weathered Caribbean house with green shutters. 2. The family on the verandah. 3. The landscape with cows and the 'FORWARD EVER BACKWARD NEVER' sign. Transform this site into the Yukayeke Heritage Retreat.", files);
        setSelectedFiles(files); // Just to show state
        setPromptText("Visualize 'The House That Love Built' (Mum & Dad's Legacy)...");
      
      } catch (error) {
        console.error("Failed to load demo images", error);
        onGenerate("Visualize 'The House That Love Built': A two-story Caribbean house with white walls and green shutters. The site includes a wraparound verandah where family gathers, a lush mountain landscape with mango trees and cows grazing, and a sign that reads 'FORWARD EVER BACKWARD NEVER'. Transform this specific site into the Yukayeke Heritage Retreat with glamping tents and pools.");
      } finally {
        setLoadingDemo(false);
      }
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000">
      <div 
        className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <div
          className={`
            relative flex flex-col items-center
            bg-zinc-900/30 
            backdrop-blur-sm
            rounded-xl border border-dashed
            transition-all duration-300
            overflow-hidden
            ${isDragging 
              ? 'border-emerald-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
        >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Main Drop Area */}
            <label 
                className="w-full flex flex-col items-center justify-center cursor-pointer p-6 md:p-8 min-h-[12rem]"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className={`relative w-16 h-16 md:w-20 md:h-20 mb-6 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 animate-spin-slow" />
                        ) : (
                            <ArrowUpTrayIcon className={`w-8 h-8 md:w-10 md:h-10 text-zinc-300 transition-all duration-300 ${isDragging ? '-translate-y-1 text-emerald-400' : ''}`} />
                        )}
                    </div>
                </div>

                <div className="space-y-2 md:space-y-4 w-full max-w-3xl text-center">
                    <h3 className="flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl text-zinc-100 leading-none font-bold tracking-tighter gap-3">
                        <span>Visualize</span>
                        <div className="h-8 sm:h-10 flex items-center justify-center w-full">
                           <CyclingText />
                        </div>
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-base font-light tracking-wide">
                        Drag & Drop photos or sketches to begin
                    </p>
                </div>
                
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    disabled={isGenerating || disabled}
                />
            </label>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="w-full px-6 pb-2 flex flex-wrap gap-2 justify-center">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative group/file bg-zinc-800 rounded border border-zinc-700 p-2 flex items-center gap-2 max-w-[200px]">
                            <PhotoIcon className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                            <button 
                                onClick={(e) => { e.preventDefault(); removeFile(idx); }}
                                className="ml-auto hover:text-red-400 text-zinc-500"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Text Input & Submit Section */}
            <div className="w-full bg-zinc-950/50 border-t border-zinc-800 p-4">
                <div className="flex gap-2 max-w-3xl mx-auto">
                    <textarea 
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Describe your vision (e.g. 'Add a pool and deck', 'Modernize the facade')..."
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none h-14"
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isGenerating || (selectedFiles.length === 0 && !promptText.trim())}
                        className={`
                            flex flex-col items-center justify-center px-6 rounded-lg font-bold uppercase text-xs tracking-wider transition-all
                            ${isGenerating || (selectedFiles.length === 0 && !promptText.trim())
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            }
                        `}
                    >
                         {isGenerating ? (
                             <CpuChipIcon className="w-5 h-5 animate-spin" />
                         ) : (
                             <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-0.5" />
                         )}
                    </button>
                </div>

                {/* Legacy Demo Button */}
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={handleLoadProject}
                        disabled={isGenerating || disabled || loadingDemo}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all duration-300"
                    >
                        {loadingDemo ? (
                             <CpuChipIcon className="w-3 h-3 text-emerald-400 animate-spin" />
                        ) : (
                             <SparklesIcon className="w-3 h-3 text-emerald-400" />
                        )}
                        <span className="text-zinc-400 hover:text-emerald-400 text-[10px] uppercase tracking-widest font-mono">
                            {loadingDemo ? 'Loading...' : "Try Demo: Mum & Dad's Legacy"}
                        </span>
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
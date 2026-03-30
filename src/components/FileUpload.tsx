import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileJson, FileCode2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/html': ['.html', '.htm']
    }
  } as any);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-[3rem] p-16 text-center cursor-pointer transition-all duration-500 ease-in-out",
          "bg-white/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group",
          isDragActive 
            ? "border-pink-500 bg-pink-50/50 scale-[1.02]" 
            : "border-gray-200 hover:border-purple-400 hover:bg-white/60"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <input {...getInputProps()} />
        <div className="flex justify-center mb-10 space-x-6 relative z-10">
          <motion.div 
            animate={isDragActive ? { scale: 1.2, rotate: -12 } : { scale: 1, rotate: -6 }}
            className="p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-xl text-white"
          >
            <FileJson size={40} />
          </motion.div>
          <motion.div 
            animate={isDragActive ? { scale: 1.2, rotate: 12 } : { scale: 1, rotate: 6 }}
            className="p-5 bg-gradient-to-br from-pink-500 to-orange-400 rounded-3xl shadow-xl text-white"
          >
            <FileCode2 size={40} />
          </motion.div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-gray-900 mb-4">
            Drop your story here
          </h3>
          <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed font-medium">
            Upload your exported Instagram <span className="text-purple-600 font-bold">JSON</span> or <span className="text-pink-600 font-bold">HTML</span> message files to begin.
          </p>
          <button className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-black transform hover:-translate-y-1 transition-all duration-300">
            Select Files
          </button>
        </div>
      </div>
      
      <div className="mt-10 text-center space-y-3">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-2">
          <span>How to get your data</span>
        </p>
        <p className="text-sm text-gray-500 font-medium">
          Instagram Settings → Your Activity → Download Your Information
        </p>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 pt-4">
          <UploadCloud size={14} />
          <span>Local processing • Secure AI analysis • No data stored</span>
        </div>
      </div>
    </motion.div>
  );
}


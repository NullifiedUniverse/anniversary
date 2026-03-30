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
          "border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out",
          "bg-white/50 backdrop-blur-sm shadow-xl",
          isDragActive 
            ? "border-pink-500 bg-pink-50/50 scale-105" 
            : "border-purple-200 hover:border-purple-400 hover:bg-purple-50/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center mb-6 space-x-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg text-white transform -rotate-6">
            <FileJson size={32} />
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-lg text-white transform rotate-6">
            <FileCode2 size={32} />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          Drop your Instagram chats here
        </h3>
        <p className="text-gray-500 mb-6">
          Upload your exported JSON or HTML message files. We support multiple files!
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all">
          Select Files
        </button>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>How to get your data: Instagram Settings → Your activity → Download your information</p>
        <p className="mt-1">Your data is processed locally and sent securely to Gemini. We don't store it.</p>
      </div>
    </motion.div>
  );
}

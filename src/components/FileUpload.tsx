import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'application/json': ['.json']
    }
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01, borderColor: 'var(--color-romantic-pink)' }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative border-4 border-dashed rounded-[3rem] p-16
          flex flex-col items-center justify-center text-center cursor-pointer
          transition-all duration-300 backdrop-blur-xl
          ${isDragActive 
            ? 'border-pink-500 bg-pink-900/20 shadow-[0_0_50px_rgba(236,72,153,0.2)]' 
            : 'border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-700 shadow-2xl'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="mb-8 p-6 bg-gray-800 rounded-full text-pink-500 shadow-inner group-hover:scale-110 transition-transform">
          <Upload size={48} />
        </div>
        
        <h3 className="text-3xl font-black text-gray-100 mb-4 tracking-tight">
          Drop your chat data here
        </h3>
        <p className="text-gray-400 text-lg font-medium max-w-sm leading-relaxed">
          Select your Instagram <span className="text-pink-400 font-bold">.html</span> or <span className="text-purple-400 font-bold">.json</span> message files to begin.
        </p>
        
        <div className="mt-8 flex items-center space-x-2 text-gray-500 bg-gray-950/50 px-4 py-2 rounded-full border border-gray-800">
          <FileText size={16} />
          <span className="text-sm font-bold uppercase tracking-widest">Zero-Knowledge Parsing</span>
        </div>
      </motion.div>

      <div className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-6 flex items-start space-x-4 backdrop-blur-md">
        <div className="p-2 bg-blue-900/30 rounded-xl text-blue-400">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-300 uppercase tracking-wider">How to get your data?</h4>
          <p className="text-sm text-blue-200/70 leading-relaxed font-medium">
            Go to Instagram Settings &rarr; Accounts Center &rarr; Your information and permissions &rarr; Download your information. Select "Messages" and choose HTML or JSON format.
          </p>
        </div>
      </div>
    </div>
  );
}

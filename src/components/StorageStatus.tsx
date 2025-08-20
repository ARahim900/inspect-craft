import React, { useEffect, useState } from 'react';
import { StorageService } from '@/services/storage-service';

export const StorageStatus: React.FC = () => {
  const [storageType, setStorageType] = useState<string>('');

  useEffect(() => {
    // Check storage type after a short delay to allow service to initialize
    const timer = setTimeout(() => {
      setStorageType(StorageService.getStorageType());
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!storageType) return null;

  const isLocal = storageType === 'Local Storage';

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 ${
      isLocal ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLocal ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
        <span>Storage: {storageType}</span>
        {isLocal && (
          <div className="group relative">
            <svg className="w-4 h-4 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 w-64">
                Data is saved locally in your browser. To enable cloud storage, configure Supabase.
                <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
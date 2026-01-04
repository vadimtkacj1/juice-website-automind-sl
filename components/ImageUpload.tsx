'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  className = '',
}: ImageUploadProps) {
  const { t } = useAdminLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent multiple simultaneous uploads using both state and ref
    if (uploading || isUploadingRef.current) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setUploading(true);
    isUploadingRef.current = true;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || t('Upload failed'));
      }

      const data = await response.json();

      // Only call onChange if we got a valid URL
      if (data.url) {
        onChange(data.url);
      }
    } catch (err: any) {
      setError(err.message || t('Failed to upload image'));
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
      // Reset file input after a small delay to prevent re-triggering
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 100);
    }
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  }

  function handleRemove() {
    onChange('');
    setUrlInput('');
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label === 'Image' ? t('Image') : label}</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === 'upload'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            {t('Upload')}
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === 'url'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LinkIcon className="w-3 h-3 inline mr-1" />
            {t('URL')}
          </button>
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50">
          <img
            src={value}
            alt={t('Preview')}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23eee" width="100" height="100"/><text fill="%23999" font-family="sans-serif" font-size="12" x="50" y="50" text-anchor="middle" dy=".3em">Image Error</text></svg>';
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && !value && (
        <div
          onClick={() => {
            if (!uploading && !isUploadingRef.current) {
              fileInputRef.current?.click();
            }
          }}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center
            transition-colors
            ${uploading || isUploadingRef.current 
              ? 'border-purple-300 bg-purple-50 cursor-not-allowed' 
              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-sm text-gray-600">{t('Uploading...')}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('Click to upload')}</p>
                <p className="text-xs text-gray-500">{t('PNG, JPG, WebP up to 5MB')}</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && !value && (
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('Image URL or use upload below')}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {t('Add')}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Hidden input for URL when in upload mode but want to change */}
      {value && (
        <p className="text-xs text-gray-500 truncate">
          {value.startsWith('/uploads') ? t('Uploaded file') : value}
        </p>
      )}
    </div>
  );
}


import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  File,
  Folder,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const UploadMedia = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [folderName, setFolderName] = useState('');
  const [uploadType, setUploadType] = useState('general');

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const simulateUpload = async (fileObj) => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadResults = [];

    for (const fileObj of files) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate upload (replace with actual API call)
        await simulateUpload(fileObj);

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'success' } : f
        ));

        uploadResults.push({ id: fileObj.id, success: true });
      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'error', 
            error: 'Upload failed' 
          } : f
        ));

        uploadResults.push({ id: fileObj.id, success: false, error });
      }
    }

    setIsUploading(false);
    
    // Clear successful uploads after 3 seconds
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'success'));
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Media</h1>
        <p className="text-gray-600">Upload images, documents, and other files to your media library</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-2">
          <Card>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive 
                  ? 'Drop the files here...' 
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports images (JPG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX)
              </p>
              <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
              <Button variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>

            {/* Upload Settings */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Media</option>
                  <option value="project">Project Images</option>
                  <option value="blog">Blog Images</option>
                  <option value="avatar">Profile Avatars</option>
                  <option value="document">Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name (Optional)
                </label>
                <div className="flex gap-2">
                  <Folder className="w-5 h-5 text-gray-400 mt-2" />
                  <Input
                    placeholder="e.g., project-screenshots"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - File List Preview */}
        <div>
          <Card title="Files to Upload">
            {files.length === 0 ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files selected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((fileObj) => (
                  <div
                    key={fileObj.id}
                    className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {fileObj.file.type.startsWith('image/') ? (
                        <ImageIcon className="w-8 h-8 text-blue-500 mr-3" />
                      ) : (
                        <File className="w-8 h-8 text-gray-500 mr-3" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                        {fileObj.status === 'uploading' && (
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileObj.id] || 0}%` }}
                            />
                          </div>
                        )}
                        {fileObj.error && (
                          <p className="text-xs text-red-600 mt-1">{fileObj.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fileObj.status)}
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={fileObj.status === 'uploading'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                isLoading={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} file(s)
              </Button>
            </div>
          </Card>

          {/* Upload Tips */}
          <Card title="Upload Tips" className="mt-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Use descriptive filenames for better organization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Images are automatically optimized for web</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Organize files in folders for easy management</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadMedia;
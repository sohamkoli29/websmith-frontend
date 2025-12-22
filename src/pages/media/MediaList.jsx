import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Trash2, 
  Image as ImageIcon,
  File,
  Download,
  Eye,
  X,
  Upload,
  Folder,
  HardDrive
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';

const MediaList = () => {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All Media' },
    { id: 'image', name: 'Images' },
    { id: 'document', name: 'Documents' },
    { id: 'avatar', name: 'Avatars' }
  ];

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, searchTerm, selectedCategory]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      // const response = await mediaService.getMedia();
      // setMedia(response.data.data || []);
      
      // Mock data for now
      const mockMedia = [
        {
          id: '1',
          filename: 'profile.jpg',
          original_name: 'profile.jpg',
          mime_type: 'image/jpeg',
          size: 204800,
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          bucket: 'avatars',
          category: 'image',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          filename: 'project-screenshot.png',
          original_name: 'project-screenshot.png',
          mime_type: 'image/png',
          size: 512000,
          url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
          bucket: 'projects',
          category: 'image',
          created_at: '2024-01-14T14:20:00Z'
        }
      ];
      
      setMedia(mockMedia);
      setFilteredMedia(mockMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
      setError('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.original_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredMedia(filtered);
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    try {
      // TODO: Replace with actual API call
      // await mediaService.deleteMedia(selectedItems);
      setSuccess(`Deleted ${selectedItems.length} item(s) successfully`);
      setSelectedItems([]);
      setDeleteModalOpen(false);
      fetchMedia();
    } catch (error) {
      setError('Failed to delete media');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your images, documents, and other media files</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <SuccessMessage 
          message={success} 
          onDismiss={() => setSuccess(null)}
        />
      )}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchMedia}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{media.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {media.filter(m => m.category === 'image').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {media.filter(m => m.category === 'document').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <File className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Used Space</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(media.reduce((sum, item) => sum + (item.size || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Folder className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Media Content */}
      {filteredMedia.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Get started by uploading your first file'}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="p-2 hover:shadow-lg transition-shadow">
              <div className="relative aspect-square mb-2">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover rounded-lg"
                />
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="absolute top-2 left-2 w-5 h-5 rounded border-gray-300"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {item.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <Card>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedia.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{item.filename}</p>
                    <p className="text-xs text-gray-500">{item.original_name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatFileSize(item.size)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className={`p-1.5 rounded ${selectedItems.includes(item.id) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {selectedItems.includes(item.id) ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Media"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete {selectedItems.length} selected item(s)?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedItems.length} item(s)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MediaList;
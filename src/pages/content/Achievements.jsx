// src/pages/content/Achievements.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import mediaService from '../../services/media';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Trophy,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Save,
  X,
  Star,
  Award,
  Target,
  FileText,
  Users,
  Zap,
  Upload, 
  Loader2
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

const achievementSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  achievement_date: yup.string().required('Achievement date is required'),
  category: yup.string().required('Category is required'),
  organization: yup.string(),
  image_url: yup.string().url('Invalid URL format'),
  icon: yup.string(),
  color: yup.string(),
  featured: yup.boolean().default(false),
});

const categoryOptions = [
  { value: 'award', label: 'Award', icon: Trophy, color: '#F59E0B' },
  { value: 'competition', label: 'Competition', icon: Target, color: '#EF4444' },
  { value: 'publication', label: 'Publication', icon: FileText, color: '#8B5CF6' },
  { value: 'milestone', label: 'Milestone', icon: Zap, color: '#10B981' },
  { value: 'certification', label: 'Certification', icon: Award, color: '#3B82F6' },
  { value: 'other', label: 'Other', icon: Star, color: '#6B7280' },
];

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(achievementSchema),
    defaultValues: {
      title: '',
      description: '',
      achievement_date: '',
      category: 'award',
      organization: '',
     
      image_url: '',
      icon: 'trophy',
      color: '#F59E0B',
      featured: false,
    }
  });

  const watchCategory = watch('category');
  const watchFeatured = watch('featured');
  const watchColor = watch('color');

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [achievements, searchTerm, selectedCategory, selectedFilter]);

  useEffect(() => {
    // Auto-update color when category changes
    const category = categoryOptions.find(c => c.value === watchCategory);
    if (category && !editingAchievement) {
      setValue('color', category.color);
    }
  }, [watchCategory, editingAchievement, setValue]);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getAchievements();
      
      if (response.data.success) {
        setAchievements(response.data.data || []);
        setFilteredAchievements(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAchievements = () => {
    let filtered = [...achievements];
    
    if (searchTerm) {
      filtered = filtered.filter(ach =>
        ach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ach.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ach.organization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ach => ach.category === selectedCategory);
    }
    
    if (selectedFilter === 'featured') {
      filtered = filtered.filter(ach => ach.featured);
    }
    
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.achievement_date) - new Date(a.achievement_date);
    });
    
    setFilteredAchievements(filtered);
  };

  const handleOpenModal = (achievement = null) => {
    setEditingAchievement(achievement);
    if (achievement) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
      };
      
      reset({
        title: achievement.title,
        description: achievement.description,
        achievement_date: formatDateForInput(achievement.achievement_date),
        category: achievement.category || 'award',
        organization: achievement.organization || '',
       
        image_url: achievement.image_url || '',
        icon: achievement.icon || 'trophy',
        color: achievement.color || '#F59E0B',
        featured: achievement.featured || false,
      });
    } else {
      reset({
        title: '',
        description: '',
        achievement_date: '',
        category: 'award',
        organization: '',
        
        image_url: '',
        icon: 'trophy',
        color: '#F59E0B',
        featured: false,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAchievement(null);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      let response;
      if (editingAchievement) {
        response = await contentService.updateAchievement(editingAchievement.id, data);
      } else {
        response = await contentService.createAchievement(data);
      }
      
      if (response.data.success) {
        await fetchAchievements();
        setSuccess(`Achievement ${editingAchievement ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      setError(error.response?.data?.error || 'Failed to save achievement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    setError('File size exceeds 5MB limit');
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    setError('Invalid file type. Please upload an image (JPG, PNG, WebP, GIF)');
    return;
  }

  try {
    setIsUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'general');

    const response = await mediaService.uploadFile(formData);
    
    if (response.data.success) {
      const imageUrl = response.data.data.upload.url;
      setValue('image_url', imageUrl, { shouldValidate: true, shouldDirty: true });
      setSuccess('Image uploaded successfully!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    setError('Failed to upload image. Please try again.');
  } finally {
    setIsUploadingImage(false);
  }
};

  const handleDeleteAchievement = async () => {
    try {
      if (!achievementToDelete) return;
      
      await contentService.deleteAchievement(achievementToDelete.id);
      await fetchAchievements();
      setSuccess('Achievement deleted successfully!');
      setDeleteConfirmOpen(false);
      setAchievementToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting achievement:', error);
      setError('Failed to delete achievement');
    }
  };

  const toggleFeatured = async (achievement) => {
    try {
      await contentService.updateAchievement(achievement.id, { 
        featured: !achievement.featured 
      });
      await fetchAchievements();
      setSuccess(`Achievement ${!achievement.featured ? 'featured' : 'unfeatured'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update achievement');
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat ? cat.icon : Trophy;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getCategoryCount = (category) => achievements.filter(a => a.category === category).length;
  const getFeaturedCount = () => achievements.filter(a => a.featured).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Showcase your accomplishments and milestones</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}
      {error && <ErrorMessage message={error} onRetry={fetchAchievements} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{getFeaturedCount()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Awards</p>
              <p className="text-2xl font-bold text-gray-900">{getCategoryCount('award')}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(achievements.map(a => a.category)).size}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label} ({getCategoryCount(cat.value)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Achievements</option>
              <option value="featured">Featured Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedFilter('all'); }}>
                Clear
              </Button>
              <Button variant="outline" className="flex-1" onClick={fetchAchievements}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements Timeline */}
      {filteredAchievements.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start showcasing your accomplishments'}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Achievement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAchievements.map((achievement) => {
            const Icon = getCategoryIcon(achievement.category);
            return (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${achievement.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: achievement.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{achievement.title}</h3>
                        {achievement.organization && (
                          <p className="text-sm text-gray-600">{achievement.organization}</p>
                        )}
                      </div>
                      {achievement.featured && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{achievement.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${achievement.color}20`, color: achievement.color }}>
                          {categoryOptions.find(c => c.value === achievement.category)?.label}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(achievement.achievement_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        
                        <button onClick={() => handleOpenModal(achievement)} className="text-blue-600 hover:text-blue-700">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAchievementToDelete(achievement);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingAchievement ? 'Edit Achievement' : 'Add New Achievement'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Achievement Title" placeholder="e.g., Hackathon Winner, Best Paper Award" error={errors.title?.message} {...register('title')} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea rows={3} className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe your achievement..." {...register('description')} />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('category')}>
                {categoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <Input label="Achievement Date" type="date" error={errors.achievement_date?.message} {...register('achievement_date')} required icon={Calendar} />
          </div>

          <Input label="Organization" placeholder="e.g., IEEE, ACM, Google" error={errors.organization?.message} {...register('organization')} icon={Users} />

          <div className="grid grid-cols-2 gap-4">
        

{/* Add this instead: */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Achievement Image
  </label>
  
  {watch('image_url') ? (
    <div className="relative group mb-3">
      <img
        src={watch('image_url')}
        alt="Achievement preview"
        className="w-full h-48 object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <label className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-black"
            disabled={isUploadingImage}
          >
            {isUploadingImage ? 'Uploading...' : 'Change Image'}
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>
    </div>
  ) : (
    <div 
      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mb-3"
      onClick={() => document.getElementById('achievement-image-input').click()}
    >
      {isUploadingImage ? (
        <>
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
          <p className="text-gray-600">Uploading image...</p>
        </>
      ) : (
        <>
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">Upload Achievement Image</p>
          <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
        </>
      )}
    </div>
  )}
  
  <input
    id="achievement-image-input"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleImageUpload}
  />
  
  <Input
    className="mt-3"
    placeholder="Or enter image URL directly"
    value={watch('image_url') || ''}
    onChange={(e) => setValue('image_url', e.target.value, { shouldDirty: true })}
    error={errors.image_url?.message}
  />
</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-gray-300" style={{ backgroundColor: watchColor }} />
              <input type="color" value={watchColor} onChange={(e) => setValue('color', e.target.value)} className="w-10 h-10 cursor-pointer rounded-lg border border-gray-300 p-0" />
              <input type="text" {...register('color')} placeholder="#3B82F6" className="flex-1 text-black rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {watchFeatured ? <Star className="w-5 h-5 text-yellow-600 mr-2" /> : <Star className="w-5 h-5 text-gray-400 mr-2" />}
              <div>
                <p className="font-medium text-gray-900">Featured Achievement</p>
                <p className="text-sm text-gray-600">Highlight on portfolio</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('featured')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {editingAchievement ? 'Update' : 'Add'} Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setAchievementToDelete(null); }} title="Delete Achievement" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete <strong>{achievementToDelete?.title}</strong>?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setAchievementToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAchievement}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Achievement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Achievements;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Star,
  User,
  Building,
  Award,
  Image as ImageIcon,
  Save,
  X,
  Quote,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

const testimonialSchema = yup.object({
  name: yup.string().required('Name is required'),
  role: yup.string(),
  company: yup.string(),
  content: yup.string().required('Testimonial content is required').min(20, 'Content should be at least 20 characters'),
  avatar_url: yup.string().url('Invalid URL format'),
  rating: yup.number()
    .typeError('Rating must be a number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .default(5),
  featured: yup.boolean().default(false),
});

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(testimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      company: '',
      content: '',
      avatar_url: '',
      rating: 5,
      featured: false,
    }
  });

  const watchFeatured = watch('featured');
  const watchRating = watch('rating');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm, selectedFilter]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getTestimonials();
      
      if (response.data.success) {
        setTestimonials(response.data.data || []);
        setFilteredTestimonials(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(testimonial =>
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedFilter === 'featured') {
      filtered = filtered.filter(t => t.featured);
    } else if (selectedFilter === 'non-featured') {
      filtered = filtered.filter(t => !t.featured);
    }
    
    // Sort by featured, then rating, then date
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    setFilteredTestimonials(filtered);
  };

  const handleOpenModal = (testimonial = null) => {
    setEditingTestimonial(testimonial);
    if (testimonial) {
      reset({
        name: testimonial.name,
        role: testimonial.role || '',
        company: testimonial.company || '',
        content: testimonial.content,
        avatar_url: testimonial.avatar_url || '',
        rating: testimonial.rating || 5,
        featured: testimonial.featured || false,
      });
    } else {
      reset({
        name: '',
        role: '',
        company: '',
        content: '',
        avatar_url: '',
        rating: 5,
        featured: false,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTestimonial(null);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      let response;
      if (editingTestimonial) {
        response = await contentService.updateTestimonial(editingTestimonial.id, data);
      } else {
        response = await contentService.createTestimonial(data);
      }
      
      if (response.data.success) {
        await fetchTestimonials();
        setSuccess(`Testimonial ${editingTestimonial ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setError(error.response?.data?.error || 'Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async () => {
    try {
      if (!testimonialToDelete) return;
      
      await contentService.deleteTestimonial(testimonialToDelete.id);
      await fetchTestimonials();
      setSuccess('Testimonial deleted successfully!');
      setDeleteConfirmOpen(false);
      setTestimonialToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setError('Failed to delete testimonial');
    }
  };

  const toggleFeatured = async (testimonial) => {
    try {
      const updatedTestimonial = { ...testimonial, featured: !testimonial.featured };
      await contentService.updateTestimonial(testimonial.id, { featured: updatedTestimonial.featured });
      await fetchTestimonials();
      setSuccess(`Testimonial ${updatedTestimonial.featured ? 'featured' : 'unfeatured'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update testimonial');
    }
  };

  const getFeaturedCount = () => {
    return testimonials.filter(t => t.featured).length;
  };

  const getAverageRating = () => {
    if (testimonials.length === 0) return 0;
    const total = testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
    return (total / testimonials.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Manage client feedback and endorsements</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <SuccessMessage 
          message={success} 
          onDismiss={() => setSuccess(null)}
        />
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchTestimonials}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Quote className="w-6 h-6 text-blue-600" />
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
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{getAverageRating()}/5</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="w-6 h-6 text-green-600 fill-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(testimonials.filter(t => t.company).map(t => t.company)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Testimonials</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, company, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Testimonials</option>
              <option value="featured">Featured Only</option>
              <option value="non-featured">Non-Featured</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={fetchTestimonials}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Get started by adding your first testimonial'}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Testimonial
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-100" />
                </div>

                {/* Content */}
                <p className="text-gray-700 italic mb-6 line-clamp-4">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  {renderStars(testimonial.rating || 5)}
                  <span className="ml-2 text-sm text-gray-600">{testimonial.rating}/5</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center">
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <div className="text-sm text-gray-600">
                      {testimonial.role && <span>{testimonial.role}</span>}
                      {testimonial.role && testimonial.company && <span> at </span>}
                      {testimonial.company && <span className="font-medium">{testimonial.company}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeatured(testimonial)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        testimonial.featured 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {testimonial.featured ? 'Featured' : 'Feature'}
                    </button>
                    <span className="text-xs text-gray-500">
                      {formatDate(testimonial.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(testimonial)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTestimonialToDelete(testimonial);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Distribution */}
      <Card title="Rating Distribution">
        <div className="grid grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = testimonials.filter(t => t.rating === rating).length;
            const percentage = testimonials.length > 0 ? (count / testimonials.length) * 100 : 0;
            
            return (
              <div key={rating} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(rating)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add/Edit Testimonial Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Avatar Image
            </label>
            {watch('avatar_url') ? (
              <div className="relative group">
                <img
                  src={watch('avatar_url')}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-black"
                    onClick={() => setImageModalOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mx-auto"
                onClick={() => setImageModalOpen(true)}
              >
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <Input
              className="mt-3"
              placeholder="Avatar image URL"
              error={errors.avatar_url?.message}
              {...register('avatar_url')}
            />
          </div>

          <Input
            label="Full Name"
            placeholder="e.g., John Smith"
            error={errors.name?.message}
            {...register('name')}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Role/Position"
              placeholder="e.g., Product Manager"
              error={errors.role?.message}
              {...register('role')}
              icon={User}
            />
            <Input
              label="Company"
              placeholder="e.g., TechCorp Inc."
              error={errors.company?.message}
              {...register('company')}
              icon={Building}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testimonial Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.content 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="What did they say about your work?"
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating: {watchRating} stars
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${star <= watchRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              {...register('rating')}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {watchFeatured ? (
                <Award className="w-5 h-5 text-yellow-600 mr-2" />
              ) : (
                <Award className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <div>
                <p className="font-medium text-gray-900">Featured Testimonial</p>
                <p className="text-sm text-gray-600">Show prominently on your portfolio</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('featured')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Upload Avatar Image"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Drag & drop your avatar image here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <Button variant="outline" className="mt-4">
              Browse Files
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Supports JPG, PNG, WebP • Max 2MB • Recommended: 200x200px
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square border border-gray-200 rounded-full overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="w-full h-full bg-gray-100" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Input
              placeholder="Or enter image URL directly"
              className="flex-1 mr-4"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setImageModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setValue('avatar_url', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop');
                  setImageModalOpen(false);
                }}
              >
                Use Selected Image
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTestimonialToDelete(null);
        }}
        title="Delete Testimonial"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the testimonial from <strong>{testimonialToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setTestimonialToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTestimonial}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Testimonial
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Testimonials;
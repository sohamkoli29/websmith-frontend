// src/pages/content/Certificates.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Award,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Save,
  X,
  Star,
  Building,
  CheckCircle,
  Clock,
  Badge,
  Upload, 
  Loader2
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';
import mediaService from '../../services/media';


const certificateSchema = yup.object({
  title: yup.string().required('Certificate title is required'),
  issuer: yup.string().required('Issuer is required'),
  issue_date: yup.string().required('Issue date is required'),
  credential_id: yup.string(),
 // Changed from credential_url
  image_url: yup.string().url('Invalid URL format'),
  description: yup.string(),
  featured: yup.boolean().default(false),
});

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(certificateSchema),
    defaultValues: {
      title: '',
      issuer: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
      image_url: '',
      description: '',
      featured: false,
    }
  });

  const watchFeatured = watch('featured');


  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, selectedFilter]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getCertificates();
      
      if (response.data.success) {
        setCertificates(response.data.data || []);
        setFilteredCertificates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];
    
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.credential_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFilter === 'featured') {
      filtered = filtered.filter(cert => cert.featured);
    } else if (selectedFilter === 'active') {
      const today = new Date();
      filtered = filtered.filter(cert => 
        !cert.expiry_date || new Date(cert.expiry_date) > today
      );
    } else if (selectedFilter === 'expired') {
      const today = new Date();
      filtered = filtered.filter(cert => 
        cert.expiry_date && new Date(cert.expiry_date) <= today
      );
    }
    
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.issue_date) - new Date(a.issue_date);
    });
    
    setFilteredCertificates(filtered);
  };

  const handleOpenModal = (certificate = null) => {
    setEditingCertificate(certificate);
    if (certificate) {
      setSelectedSkills(Array.isArray(certificate.skills) ? certificate.skills : []);
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
      };
      
      reset({
        title: certificate.title,
        issuer: certificate.issuer,
        issue_date: formatDateForInput(certificate.issue_date),
        expiry_date: formatDateForInput(certificate.expiry_date),
        credential_id: certificate.credential_id || '',
        credential_url: certificate.credential_url || '',
        image_url: certificate.image_url || '',
        description: certificate.description || '',
        featured: certificate.featured || false,
      });
    } else {
      reset({
        title: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
        image_url: '',
        description: '',
        featured: false,
      });
      setSelectedSkills([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCertificate(null);
    setSelectedSkills([]);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const certificateData = {
        ...data,
        skills: selectedSkills,
      };

      let response;
      if (editingCertificate) {
        response = await contentService.updateCertificate(editingCertificate.id, certificateData);
      } else {
        response = await contentService.createCertificate(certificateData);
      }
      
      if (response.data.success) {
        await fetchCertificates();
        setSuccess(`Certificate ${editingCertificate ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      setError(error.response?.data?.error || 'Failed to save certificate');
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
  const handleDeleteCertificate = async () => {
    try {
      if (!certificateToDelete) return;
      
      await contentService.deleteCertificate(certificateToDelete.id);
      await fetchCertificates();
      setSuccess('Certificate deleted successfully!');
      setDeleteConfirmOpen(false);
      setCertificateToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setError('Failed to delete certificate');
    }
  };

  const toggleFeatured = async (certificate) => {
    try {
      await contentService.updateCertificate(certificate.id, { 
        featured: !certificate.featured 
      });
      await fetchCertificates();
      setSuccess(`Certificate ${!certificate.featured ? 'featured' : 'unfeatured'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update certificate');
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getFeaturedCount = () => certificates.filter(c => c.featured).length;
  const getActiveCount = () => certificates.filter(c => !isExpired(c.expiry_date)).length;
  const getExpiredCount = () => certificates.filter(c => isExpired(c.expiry_date)).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600">Manage your professional certifications</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}
      {error && <ErrorMessage message={error} onRetry={fetchCertificates} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveCount()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{getExpiredCount()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Certificates</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by title, issuer, or credential ID..."
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
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Certificates</option>
              <option value="featured">Featured Only</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSearchTerm(''); setSelectedFilter('all'); }}>
                Clear Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={fetchCertificates}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Get started by adding your first certificate'}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Certificate
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-purple-50">
                {certificate.image_url ? (
                  <img src={certificate.image_url} alt={certificate.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-16 h-16 text-blue-300" />
                  </div>
                )}
                
                {certificate.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  </div>
                )}
                
                {isExpired(certificate.expiry_date) && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                      Expired
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                  {certificate.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Building className="w-4 h-4 mr-1" />
                  {certificate.issuer}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Issued: {formatDate(certificate.issue_date)}
                  </div>
                  {certificate.expiry_date && (
                    <div className={`flex items-center ${isExpired(certificate.expiry_date) ? 'text-red-600' : ''}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      Expires: {formatDate(certificate.expiry_date)}
                    </div>
                  )}
                </div>

                {certificate.credential_id && (
                  <div className="text-xs text-gray-500 mb-3">
                    <Badge className="w-3 h-3 inline mr-1" />
                    ID: {certificate.credential_id}
                  </div>
                )}

                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {skill}
                        </span>
                      ))}
                      {certificate.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          +{certificate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {certificate.credential_url && (
                      <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => toggleFeatured(certificate)}
                      className={`text-sm ${certificate.featured ? 'text-yellow-600' : 'text-gray-400'}`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(certificate)} className="text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCertificateToDelete(certificate);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700"
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingCertificate ? 'Edit Certificate' : 'Add New Certificate'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Certificate Title" placeholder="e.g., AWS Solutions Architect" error={errors.title?.message} {...register('title')} required />

          <Input label="Issuing Organization" placeholder="e.g., Amazon Web Services" error={errors.issuer?.message} {...register('issuer')} required icon={Building} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Issue Date" type="date" error={errors.issue_date?.message} {...register('issue_date')} required icon={Calendar} />
            
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Credential ID" placeholder="ABC-123-XYZ" error={errors.credential_id?.message} {...register('credential_id')} icon={Badge} />
           
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Certificate Image
  </label>
  
  {watch('image_url') ? (
    <div className="relative group mb-3">
      <img
        src={watch('image_url')}
        alt="Certificate preview"
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
      onClick={() => document.getElementById('certificate-image-input').click()}
    >
      {isUploadingImage ? (
        <>
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
          <p className="text-gray-600">Uploading image...</p>
        </>
      ) : (
        <>
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">Upload Certificate Image</p>
          <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
        </>
      )}
    </div>
  )}
  
  <input
    id="certificate-image-input"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea rows={3} className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief description of the certificate..." {...register('description')} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {watchFeatured ? <Star className="w-5 h-5 text-yellow-600 mr-2" /> : <Star className="w-5 h-5 text-gray-400 mr-2" />}
              <div>
                <p className="font-medium text-gray-900">Featured Certificate</p>
                <p className="text-sm text-gray-600">Show prominently on portfolio</p>
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
              {editingCertificate ? 'Update Certificate' : 'Add Certificate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setCertificateToDelete(null); }} title="Delete Certificate" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete <strong>{certificateToDelete?.title}</strong>?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setCertificateToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteCertificate}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Certificates;
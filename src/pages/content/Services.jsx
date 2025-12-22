import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Settings,
  CheckCircle,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Palette,
  Code,
  Layout,
  Smartphone,
  Cloud,
  Server,
  TrendingUp 
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

const serviceSchema = yup.object({
  title: yup.string().required('Service title is required'),
  description: yup.string().required('Description is required').min(50, 'Description should be at least 50 characters'),
  icon: yup.string().required('Icon is required'),
  sort_order: yup.number().default(0),
});

const iconOptions = [
  { value: 'code', label: 'Web Development', icon: Code },
  { value: 'layout', label: 'UI/UX Design', icon: Layout },
  { value: 'smartphone', label: 'Mobile Apps', icon: Smartphone },
  { value: 'cloud', label: 'Cloud Solutions', icon: Cloud },
  { value: 'server', label: 'DevOps', icon: Server },
  { value: 'palette', label: 'Branding', icon: Palette },
  { value: 'trending-up', label: 'Consulting', icon: TrendingUp },
  { value: 'settings', label: 'Maintenance', icon: Settings },
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: 'code',
      sort_order: 0,
    }
  });

  const watchIcon = watch('icon');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getServices();
      
      if (response.data.success) {
        setServices(response.data.data || []);
        setFilteredServices(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.features && service.features.some(feature => 
          feature.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    filtered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.title.localeCompare(b.title);
    });
    
    setFilteredServices(filtered);
  };

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setSelectedFeatures(Array.isArray(service.features) ? service.features : []);
      
      reset({
        title: service.title,
        description: service.description,
        icon: service.icon || 'code',
        sort_order: service.sort_order || 0,
      });
    } else {
      reset({
        title: '',
        description: '',
        icon: 'code',
        sort_order: services.length,
      });
      setSelectedFeatures([]);
    }
    setNewFeature('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingService(null);
    setSelectedFeatures([]);
    setNewFeature('');
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const serviceData = {
        ...data,
        features: selectedFeatures.length > 0 ? selectedFeatures : [],
      };

      let response;
      if (editingService) {
        response = await contentService.updateService(editingService.id, serviceData);
      } else {
        response = await contentService.createService(serviceData);
      }
      
      if (response.data.success) {
        await fetchServices();
        setSuccess(`Service ${editingService ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.response?.data?.error || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      if (!serviceToDelete) return;
      
      await contentService.deleteService(serviceToDelete.id);
      await fetchServices();
      setSuccess('Service deleted successfully!');
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service');
    }
  };

  const handleMoveService = async (serviceId, direction) => {
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) return;
    
    const newServices = [...services];
    const targetIndex = direction === 'up' ? serviceIndex - 1 : serviceIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newServices.length) return;
    
    const tempOrder = newServices[serviceIndex].sort_order;
    newServices[serviceIndex].sort_order = newServices[targetIndex].sort_order;
    newServices[targetIndex].sort_order = tempOrder;
    
    [newServices[serviceIndex], newServices[targetIndex]] = [newServices[targetIndex], newServices[serviceIndex]];
    
    setServices(newServices);
    
    try {
      await contentService.updateService(serviceId, { sort_order: newServices[serviceIndex].sort_order });
      await contentService.updateService(newServices[targetIndex].id, { sort_order: newServices[targetIndex].sort_order });
    } catch (error) {
      console.error('Error updating service order:', error);
      fetchServices();
    }
  };

  const addFeature = () => {
    const trimmedFeature = newFeature.trim();
    if (trimmedFeature && !selectedFeatures.includes(trimmedFeature)) {
      setSelectedFeatures([...selectedFeatures, trimmedFeature]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setSelectedFeatures(selectedFeatures.filter((_, i) => i !== index));
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Settings;
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
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage the services you offer to clients</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}
      {error && <ErrorMessage message={error} onRetry={fetchServices} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Features Listed</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.reduce((total, service) => total + (service.features?.length || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Icon Types</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(services.map(s => s.icon)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Services</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by title, description, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
              <Button variant="outline" className="flex-1" onClick={fetchServices}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first service'}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Service
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const Icon = getIconComponent(service.icon);
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-xl mr-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-xs text-gray-500">Order #{service.sort_order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveService(service.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveService(service.id, 'down')}
                        disabled={index === filteredServices.length - 1}
                        className={`p-1 ${index === filteredServices.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6">{service.description}</p>

                  {service.features && service.features.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Key Features:</p>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {service.features.length > 4 && (
                          <li className="text-sm text-gray-500">+{service.features.length - 4} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {new Date(service.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(service)} className="text-blue-600 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setServiceToDelete(service);
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
            );
          })}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingService ? 'Edit Service' : 'Add New Service'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Service Title"
            placeholder="e.g., Web Development, UI/UX Design"
            error={errors.title?.message}
            {...register('title')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your service in detail..."
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Icon</label>
            <div className="grid grid-cols-4 gap-3">
              {iconOptions.map(icon => {
                const IconComponent = icon.icon;
                const isSelected = watchIcon === icon.value;
                return (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setValue('icon', icon.value)}
                    className={`p-4 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center">{icon.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Key Features</label>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a new feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addFeature} disabled={!newFeature.trim()}>
                Add
              </Button>
            </div>

            {selectedFeatures.length > 0 && (
              <div className="space-y-2">
                {selectedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                    <button type="button" onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input label="Display Order" type="number" min="0" placeholder="0" {...register('sort_order')} />

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
        }}
        title="Delete Service"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{serviceToDelete?.title}</strong>?
          </p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setServiceToDelete(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteService}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Services;
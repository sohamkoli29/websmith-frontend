import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Calendar,
  MapPin,
  Building,
  Briefcase,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

const experienceSchema = yup.object({
  company: yup.string().required('Company name is required').trim(),
  position: yup.string().required('Position title is required').trim(),
  description: yup.string().required('Description is required').min(50, 'Description should be at least 50 characters').trim(),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().when('current', {
    is: false,
    then: (schema) => schema.required('End date is required when not current position'),
    otherwise: (schema) => schema.nullable().notRequired()
  }),
  current: yup.boolean().default(false),
  location: yup.string().trim(),
  technologies: yup.array().default([]),
  sort_order: yup.number().default(0),
});

const technologyOptions = [
  'React', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript', 'Node.js',
  'Express.js', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot',
  'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'C#', '.NET', 'PostgreSQL',
  'MongoDB', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'GCP', 'Firebase', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'Microservices'
];

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(experienceSchema),
    defaultValues: {
      company: '',
      position: '',
      description: '',
      start_date: '',
      end_date: '',
      current: false,
      location: '',
      technologies: [],
      sort_order: 0,
    }
  });

  const watchCurrent = watch('current');
  const watchStartDate = watch('start_date');

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [experiences, searchTerm, selectedFilter]);

  // Clear end_date when current is checked
  useEffect(() => {
    if (watchCurrent) {
      setValue('end_date', '');
    }
  }, [watchCurrent, setValue]);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getExperiences();
      
      if (response.data.success) {
        const data = response.data.data || [];
        setExperiences(data);
        setFilteredExperiences(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experience entries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = [...experiences];
    
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.technologies && exp.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    if (selectedFilter === 'current') {
      filtered = filtered.filter(exp => exp.current);
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(exp => !exp.current);
    }
    
    filtered.sort((a, b) => {
      if (a.current !== b.current) return b.current - a.current;
      if (a.start_date !== b.start_date) return new Date(b.start_date) - new Date(a.start_date);
      return a.sort_order - b.sort_order;
    });
    
    setFilteredExperiences(filtered);
  };

  const handleOpenModal = (experience = null) => {
    setEditingExperience(experience);
    if (experience) {
      setSelectedTechnologies(Array.isArray(experience.technologies) ? experience.technologies : []);
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      reset({
        company: experience.company,
        position: experience.position,
        description: experience.description,
        start_date: formatDateForInput(experience.start_date),
        end_date: experience.current ? '' : formatDateForInput(experience.end_date),
        current: experience.current || false,
        location: experience.location || '',
        technologies: experience.technologies || [],
        sort_order: experience.sort_order || 0,
      });
    } else {
      reset({
        company: '',
        position: '',
        description: '',
        start_date: '',
        end_date: '',
        current: false,
        location: '',
        technologies: [],
        sort_order: 0,
      });
      setSelectedTechnologies([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExperience(null);
    setSelectedTechnologies([]);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Validate dates before sending
      if (!data.current && !data.end_date) {
        setError('End date is required for past positions');
        setIsSaving(false);
        return;
      }

      // Format dates to ISO string for backend
      const formatDateToISO = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      };

      const experienceData = {
        company: data.company.trim(),
        position: data.position.trim(),
        description: data.description.trim(),
        start_date: formatDateToISO(data.start_date),
        end_date: data.current ? null : formatDateToISO(data.end_date),
        current: Boolean(data.current),
        location: data.location ? data.location.trim() : '',
        technologies: selectedTechnologies,
        sort_order: Number(data.sort_order) || 0,
      };

      console.log('Submitting experience data:', experienceData);

      let response;
      if (editingExperience) {
        response = await contentService.updateExperience(editingExperience.id, experienceData);
      } else {
        response = await contentService.createExperience(experienceData);
      }
      
      if (response.data.success) {
        await fetchExperiences();
        setSuccess(`Experience ${editingExperience ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save experience';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async () => {
    try {
      if (!experienceToDelete) return;
      
      await contentService.deleteExperience(experienceToDelete.id);
      await fetchExperiences();
      setSuccess('Experience deleted successfully!');
      setDeleteConfirmOpen(false);
      setExperienceToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting experience:', error);
      setError('Failed to delete experience');
    }
  };

  const toggleCurrent = async (experience) => {
    try {
      const updatedExperience = { 
        current: !experience.current,
        end_date: !experience.current ? null : experience.end_date
      };
      await contentService.updateExperience(experience.id, updatedExperience);
      await fetchExperiences();
      setSuccess(`Experience marked as ${updatedExperience.current ? 'current' : 'past'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating current status:', error);
      setError('Failed to update experience');
    }
  };

  const toggleTechnology = (tech) => {
    const newTechs = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    
    setSelectedTechnologies(newTechs);
  };

  const handleMoveExperience = async (experienceId, direction) => {
    const expIndex = experiences.findIndex(e => e.id === experienceId);
    if (expIndex === -1) return;
    
    const newExperiences = [...experiences];
    const targetIndex = direction === 'up' ? expIndex - 1 : expIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newExperiences.length) return;
    
    const tempOrder = newExperiences[expIndex].sort_order;
    newExperiences[expIndex].sort_order = newExperiences[targetIndex].sort_order;
    newExperiences[targetIndex].sort_order = tempOrder;
    
    [newExperiences[expIndex], newExperiences[targetIndex]] = [newExperiences[targetIndex], newExperiences[expIndex]];
    
    setExperiences(newExperiences);
    
    try {
      await contentService.updateExperience(experienceId, { sort_order: newExperiences[expIndex].sort_order });
      await contentService.updateExperience(newExperiences[targetIndex].id, { sort_order: newExperiences[targetIndex].sort_order });
    } catch (error) {
      console.error('Error updating experience order:', error);
      fetchExperiences();
    }
  };

  const getCurrentCount = () => {
    return experiences.filter(e => e.current).length;
  };

  const getTotalDuration = () => {
    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.start_date);
      const end = exp.current ? new Date() : new Date(exp.end_date);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });
    return Math.floor(totalMonths / 12);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
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
          <h1 className="text-2xl font-bold text-gray-900">Experience</h1>
          <p className="text-gray-600">Manage your professional work history</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}
      {error && <ErrorMessage message={error} onRetry={fetchExperiences} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Positions</p>
              <p className="text-2xl font-bold text-gray-900">{experiences.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Roles</p>
              <p className="text-2xl font-bold text-gray-900">{getCurrentCount()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Experience</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalDuration()} years</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(experiences.map(e => e.company)).size}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Experience</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by company, position, or technology..."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Experience</option>
              <option value="current">Current Roles</option>
              <option value="past">Past Experience</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSearchTerm(''); setSelectedFilter('all'); }}>
                Clear Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={fetchExperiences}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      {filteredExperiences.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experience entries found</h3>
            <p className="text-gray-600">Get started by adding your first experience</p>
            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Experience
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gray-200" />

          {filteredExperiences.map((exp, index) => (
            <div key={exp.id} className="relative mb-8">
              <div className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white ${
                exp.current ? 'bg-green-500' : 'bg-blue-500'
              }`} />

              <Card className={`ml-8 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:ml-6' : 'md:ml-auto md:mr-6'}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Building className="w-4 h-4 mr-1" />
                        <span>{exp.company}</span>
                        {exp.location && (
                          <>
                            <span className="mx-2">•</span>
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveExperience(exp.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveExperience(exp.id, 'down')}
                        disabled={index === filteredExperiences.length - 1}
                        className={`p-1 ${index === filteredExperiences.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                      {exp.current && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm">{exp.description}</p>

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Technologies Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.technologies.slice(0, 5).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {tech}
                          </span>
                        ))}
                        {exp.technologies.length > 5 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{exp.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleCurrent(exp)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        exp.current ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {exp.current ? 'Mark as Past' : 'Mark as Current'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(exp)} className="text-blue-600 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setExperienceToDelete(exp);
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
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Experience Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingExperience ? 'Edit Experience' : 'Add New Experience'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Display form-level errors */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-1">Please fix the following errors:</p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {errors.company && <li>{errors.company.message}</li>}
                {errors.position && <li>{errors.position.message}</li>}
                {errors.description && <li>{errors.description.message}</li>}
                {errors.start_date && <li>{errors.start_date.message}</li>}
                {errors.end_date && <li>{errors.end_date.message}</li>}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Company Name" placeholder="e.g., Google, Microsoft" error={errors.company?.message} {...register('company')} required icon={Building} />
            <Input label="Position Title" placeholder="e.g., Senior Frontend Developer" error={errors.position?.message} {...register('position')} required icon={Briefcase} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your responsibilities and achievements..."
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Minimum 50 characters required</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input 
                label="Start Date" 
                type="date" 
                error={errors.start_date?.message} 
                {...register('start_date')} 
                required 
                icon={Calendar}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Input 
                label="End Date" 
                type="date" 
                error={errors.end_date?.message} 
                {...register('end_date')} 
                disabled={watchCurrent} 
                icon={Calendar}
                min={watchStartDate}
                max={new Date().toISOString().split('T')[0]}
              />
              {!watchCurrent && (
                <p className="text-xs text-gray-500 mt-1">Required for past positions</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className={`w-5 h-5 mr-2 ${watchCurrent ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900">Current Position</p>
                <p className="text-sm text-gray-600">{watchCurrent ? 'Currently working here' : 'This is a past position'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('current')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
            </label>
          </div>

          <Input label="Location" placeholder="e.g., San Francisco, CA (Remote)" error={errors.location?.message} {...register('location')} icon={MapPin} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Technologies Used</label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {technologyOptions.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechnology(tech)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedTechnologies.includes(tech)
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            
            {selectedTechnologies.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Technologies ({selectedTechnologies.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnologies.map(tech => (
                    <span key={tech} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center">
                      {tech}
                      <button type="button" onClick={() => toggleTechnology(tech)} className="ml-2 hover:text-blue-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {editingExperience ? 'Update Experience' : 'Add Experience'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setExperienceToDelete(null); }} title="Delete Experience" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete your experience at <strong>{experienceToDelete?.company}</strong>?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setExperienceToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteExperience}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Experience
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Experience;
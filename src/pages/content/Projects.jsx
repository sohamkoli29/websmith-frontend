import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Star,
  StarOff,
  ExternalLink,
  Github,
  ImageIcon,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Upload
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';
import mediaService from '../../services/media';

const projectSchema = yup.object({
  title: yup.string().required('Project title is required'),
  description: yup.string().required('Description is required').min(100, 'Description should be at least 100 characters'),
  short_description: yup.string().max(500, 'Short description should be less than 500 characters'),
  image_url: yup.string().url('Invalid URL format'),
  project_url: yup.string().url('Invalid URL format'),
  github_url: yup.string().url('Invalid URL format'),
  technologies: yup.array(),
  featured: yup.boolean().default(false),
  sort_order: yup.number().default(0),
});

const technologyOptions = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript',
  'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'PHP', 'Laravel',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'AWS', 'Firebase',
  'Tailwind CSS', 'Bootstrap', 'Material-UI', 'GraphQL', 'REST API',
  'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jest', 'Cypress','Supabase','WebRTC','Socket.io'
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      image_url: '',
      project_url: '',
      github_url: '',
      technologies: [],
      featured: false,
      sort_order: 0,
    }
  });

  const watchFeatured = watch('featured');
  const watchImageUrl = watch('image_url');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedFilter]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getProjects();
      
      if (response.data.success) {
        setProjects(response.data.data || []);
        setFilteredProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.technologies && project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    if (selectedFilter === 'featured') {
      filtered = filtered.filter(project => project.featured);
    } else if (selectedFilter === 'non-featured') {
      filtered = filtered.filter(project => !project.featured);
    }
    
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    setFilteredProjects(filtered);
  };

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    if (project) {
      setSelectedTechnologies(Array.isArray(project.technologies) ? project.technologies : []);
      
      reset({
        title: project.title,
        description: project.description,
        short_description: project.short_description || '',
        image_url: project.image_url || '',
        project_url: project.project_url || '',
        github_url: project.github_url || '',
        technologies: project.technologies || [],
        featured: project.featured || false,
        sort_order: project.sort_order || 0,
      });
    } else {
      reset({
        title: '',
        description: '',
        short_description: '',
        image_url: '',
        project_url: '',
        github_url: '',
        technologies: [],
        featured: false,
        sort_order: 0,
      });
      setSelectedTechnologies([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setSelectedTechnologies([]);
  };

  const handleImageUpload = async (file) => {
    try {
      setIsUploadingImage(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'project');
      
      const response = await mediaService.uploadFile(formData);
      
      if (response.data.success) {
        const imageUrl = response.data.data.upload.url;
        setValue('image_url', imageUrl, { shouldValidate: true, shouldDirty: true });
        setSuccess('Image uploaded successfully!');
        setTimeout(() => setSuccess(null), 3000);
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

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit');
          return;
        }
        handleImageUpload(file);
      } else {
        alert('Please select an image file (JPG, PNG, WebP)');
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const projectData = {
        ...data,
        technologies: selectedTechnologies,
      };

      let response;
      if (editingProject) {
        response = await contentService.updateProject(editingProject.id, projectData);
      } else {
        response = await contentService.createProject(projectData);
      }
      
      if (response.data.success) {
        await fetchProjects();
        setSuccess(`Project ${editingProject ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.response?.data?.error || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!projectToDelete) return;
      
      await contentService.deleteProject(projectToDelete.id);
      await fetchProjects();
      setSuccess('Project deleted successfully!');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  const toggleFeatured = async (project) => {
    try {
      const updatedProject = { ...project, featured: !project.featured };
      await contentService.updateProject(project.id, { featured: updatedProject.featured });
      await fetchProjects();
      setSuccess(`Project ${updatedProject.featured ? 'marked as featured' : 'unfeatured'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update project');
    }
  };

  const toggleTechnology = (tech) => {
    const newTechs = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    
    setSelectedTechnologies(newTechs);
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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your portfolio projects and showcase your work</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}
      {error && <ErrorMessage message={error} onRetry={fetchProjects} />}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Projects</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by title, description, or technology..."
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
              <option value="all">All Projects</option>
              <option value="featured">Featured Only</option>
              <option value="non-featured">Non-Featured</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSearchTerm(''); setSelectedFilter('all'); }}>
                Clear Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={fetchProjects}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Get started by adding your first project</p>
            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {project.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleFeatured(project)}
                    className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    {project.featured ? <Star className="w-4 h-4 text-yellow-600" /> : <StarOff className="w-4 h-4 text-gray-600" />}
                  </button>
                  <button onClick={() => handleOpenModal(project)} className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.short_description || project.description.substring(0, 120)}...
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {project.project_url && (
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setProjectToDelete(project);
                      setDeleteConfirmOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Project Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingProject ? 'Edit Project' : 'Add New Project'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Input label="Project Title" placeholder="e.g., E-commerce Platform" error={errors.title?.message} {...register('title')} required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your project in detail..."
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  rows={2}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary for project cards"
                  {...register('short_description')}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Project Image</label>
                {watchImageUrl ? (
                  <div className="relative group">
                    <img src={watchImageUrl} alt="Project preview" className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black" type="button">
                          Change Image
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label 
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={handleImageDrop}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center">
                        <LoadingSpinner size="md" />
                        <p className="text-gray-600 mt-2">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600">Upload Project Image</p>
                        <p className="text-sm text-gray-500 mt-1">1200x800px recommended</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                )}
                <Input className="mt-3" placeholder="Or enter image URL" error={errors.image_url?.message} {...register('image_url')} />
              </div>

              <Input label="Live Demo URL" placeholder="https://demo.example.com" error={errors.project_url?.message} {...register('project_url')} icon={ExternalLink} />
              <Input label="GitHub Repository URL" placeholder="https://github.com/username/project" error={errors.github_url?.message} {...register('github_url')} icon={Github} />

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {watchFeatured ? <Star className="w-5 h-5 text-yellow-600 mr-2" /> : <StarOff className="w-5 h-5 text-gray-400 mr-2" />}
                  <div>
                    <p className="font-medium text-gray-900">Featured Project</p>
                    <p className="text-sm text-gray-600">Show prominently</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" {...register('featured')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Technologies Used</label>
            <div className="flex flex-wrap gap-2">
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
                <p className="text-sm font-medium text-gray-700 mb-2">Selected:</p>
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

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setProjectToDelete(null); }} title="Delete Project" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete <strong>{projectToDelete?.title}</strong>?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setProjectToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
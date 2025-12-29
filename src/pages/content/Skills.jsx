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
  ChevronUp, 
  ChevronDown,
  Save,
  X,
  Award,
  Palette,
  Star,
  TrendingUp
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

const skillSchema = yup.object({
  name: yup.string().required('Skill name is required'),
  category: yup.string().required('Category is required'),
  proficiency: yup.number()
    .typeError('Proficiency must be a number')
    .min(1, 'Proficiency must be between 1 and 100')
    .max(100, 'Proficiency must be between 1 and 100')
    .required('Proficiency is required'),
  icon: yup.string(),
  color: yup.string(),
  sort_order: yup.number().default(0),
});

const categoryOptions = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Testing',
  'Tools',
  'Soft Skills',
  'Programming Language',
  'Other'
];

const iconOptions = [
  'react', 'node', 'express', 'vue', 'angular', 'javascript', 'typescript',
  'html', 'css', 'python', 'java', 'php', 'laravel', 'docker', 'aws',
  'git', 'github', 'figma', 'adobe', 'mongodb', 'postgresql', 'mysql'
];

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(skillSchema),
    defaultValues: {
      name: '',
      category: 'Frontend',
      proficiency: 70,
      icon: 'react',
      color: '#3B82F6',
      sort_order: 0,
    }
  });

  const selectedColor = watch('color');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [skills, searchTerm, selectedCategory]);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getSkills();
      
      if (response.data.success) {
        setSkills(response.data.data || []);
        setFilteredSkills(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...skills];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }
    
    // Sort by sort_order then name
    filtered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.name.localeCompare(b.name);
    });
    
    setFilteredSkills(filtered);
  };

  const handleOpenModal = (skill = null) => {
    setEditingSkill(skill);
    if (skill) {
      reset({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        icon: skill.icon || 'react',
        color: skill.color || '#3B82F6',
        sort_order: skill.sort_order || 0,
      });
    } else {
      reset({
        name: '',
        category: 'Frontend',
        proficiency: 70,
        icon: 'react',
        color: '#3B82F6',
        sort_order: 0,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSkill(null);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      let response;
      if (editingSkill) {
        response = await contentService.updateSkill(editingSkill.id, data);
      } else {
        response = await contentService.createSkill(data);
      }
      
      if (response.data.success) {
        await fetchSkills();
        setSuccess(`Skill ${editingSkill ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      setError(error.response?.data?.error || 'Failed to save skill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async () => {
    try {
      if (!skillToDelete) return;
      
      await contentService.deleteSkill(skillToDelete.id);
      await fetchSkills();
      setSuccess('Skill deleted successfully!');
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError('Failed to delete skill');
    }
  };

  const handleMoveSkill = async (skillId, direction) => {
    const skillIndex = skills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) return;
    
    const newSkills = [...skills];
    const targetIndex = direction === 'up' ? skillIndex - 1 : skillIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newSkills.length) return;
    
    // Swap sort_order
    const tempOrder = newSkills[skillIndex].sort_order;
    newSkills[skillIndex].sort_order = newSkills[targetIndex].sort_order;
    newSkills[targetIndex].sort_order = tempOrder;
    
    // Swap positions
    [newSkills[skillIndex], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[skillIndex]];
    
    setSkills(newSkills);
    
    // Update on server
    try {
      await contentService.updateSkill(skillId, { sort_order: newSkills[skillIndex].sort_order });
      await contentService.updateSkill(newSkills[targetIndex].id, { sort_order: newSkills[targetIndex].sort_order });
    } catch (error) {
      console.error('Error updating skill order:', error);
      // Revert on error
      fetchSkills();
    }
  };

  const getProficiencyColor = (proficiency) => {
    if (proficiency >= 80) return 'bg-green-500';
    if (proficiency >= 60) return 'bg-blue-500';
    if (proficiency >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryCount = (category) => {
    return skills.filter(skill => skill.category === category).length;
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
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600">Manage your technical and professional skills</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Skill
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
          onRetry={fetchSkills}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Skills</p>
              <p className="text-2xl font-bold">{skills.length}</p>
            </div>
            <Award className="w-10 h-10 opacity-80" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Categories</p>
              <p className="text-2xl font-bold">{new Set(skills.map(s => s.category)).size}</p>
            </div>
            <Filter className="w-10 h-10 opacity-80" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Proficiency</p>
              <p className="text-2xl font-bold">
                {skills.length > 0 
                  ? Math.round(skills.reduce((sum, skill) => sum + (skill.proficiency || 0), 0) / skills.length)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Frontend Skills</p>
              <p className="text-2xl font-bold">{getCategoryCount('Frontend')}</p>
            </div>
            <Star className="w-10 h-10 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Skills</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category} ({getCategoryCount(category)})
                </option>
              ))}
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
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={fetchSkills}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Table */}
      <Card>
        {filteredSkills.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Get started by adding your first skill'}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Skill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSkills.map((skill, index) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: skill.color || '#3B82F6' }}
                        >
                          <span className="text-white font-medium">
                            {skill.icon ? skill.icon.charAt(0).toUpperCase() : skill.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-500">{skill.icon}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        skill.category === 'Frontend' ? 'bg-blue-100 text-blue-800' :
                        skill.category === 'Backend' ? 'bg-green-100 text-green-800' :
                        skill.category === 'Database' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${getProficiencyColor(skill.proficiency)}`}
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{skill.proficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSkill(skill.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveSkill(skill.id, 'down')}
                          disabled={index === filteredSkills.length - 1}
                          className={`p-1 rounded ${index === filteredSkills.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 ml-2">#{skill.sort_order}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(skill)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSkillToDelete(skill);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Category Distribution */}
      <Card title="Skills by Category">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categoryOptions.map(category => {
            const count = getCategoryCount(category);
            if (count === 0) return null;
            
            return (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / skills.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add/Edit Skill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Skill Name"
            placeholder="e.g., React, Node.js, Figma"
            error={errors.name?.message}
            {...register('name')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('category')}
            >
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency: {watch('proficiency')}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              {...register('proficiency')}
            />
            {errors.proficiency && (
              <p className="text-sm text-red-600 mt-1">{errors.proficiency.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon Name
              </label>
              <select
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('icon')}
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                />
                <Input
                  type="text"
                  placeholder="#3B82F6"
                  {...register('color')}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Input
            label="Display Order"
            type="number"
            min="0"
            placeholder="0"
            {...register('sort_order')}
          />

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
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSkillToDelete(null);
        }}
        title="Delete Skill"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{skillToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSkillToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSkill}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Skill
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Skills;
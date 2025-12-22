import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  Save,
  X,
  ExternalLink,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';

// Updated schema - removed content validation since it's handled separately
const blogSchema = yup.object({
  title: yup.string().required('Title is required'),
  slug: yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  excerpt: yup.string().max(500, 'Excerpt should be less than 500 characters'),
  cover_image: yup.string().url('Invalid URL format'),
  author: yup.string().required('Author name is required'),
  published: yup.boolean().default(false),
});

const tagOptions = [
  'Web Development', 'React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS',
  'Frontend', 'Backend', 'API', 'Database', 'DevOps', 'Cloud', 'AWS',
  'Performance', 'Security', 'Testing', 'UI/UX', 'Design', 'Mobile',
  'Career', 'Tutorial', 'Guide', 'Tips', 'Best Practices', 'Case Study'
];

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [content, setContent] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      cover_image: '',
      author: 'Admin',
      published: false,
    }
  });

  const watchPublished = watch('published');
  const watchTitle = watch('title');

useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  fetchBlogs();
}, []);


  useEffect(() => {
    // Auto-generate slug from title
    if (watchTitle && !editingBlog) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [watchTitle, editingBlog, setValue]);

  useEffect(() => {
    filterBlogs();
  }, [blogs, searchTerm, selectedFilter]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getBlogs();
      
      if (response.data.success) {
        setBlogs(response.data.data || []);
        setFilteredBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = [...blogs];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.tags && blog.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Filter by status
    if (selectedFilter === 'published') {
      filtered = filtered.filter(blog => blog.published);
    } else if (selectedFilter === 'drafts') {
      filtered = filtered.filter(blog => !blog.published);
    }
    
    // Sort by published date, then created date
    filtered.sort((a, b) => {
      const dateA = a.published_at || a.created_at;
      const dateB = b.published_at || b.created_at;
      return new Date(dateB) - new Date(dateA);
    });
    
    setFilteredBlogs(filtered);
  };

  const handleOpenModal = (blog = null) => {
    setEditingBlog(blog);
    if (blog) {
      setSelectedTags(Array.isArray(blog.tags) ? blog.tags : []);
      setContent(blog.content || '');
      
      reset({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        cover_image: blog.cover_image || '',
        author: blog.author || 'Admin',
        published: blog.published || false,
      });
    } else {
      reset({
        title: '',
        slug: '',
        excerpt: '',
        cover_image: '',
        author: 'Admin',
        published: false,
      });
      setSelectedTags([]);
      setContent('');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBlog(null);
    setSelectedTags([]);
    setContent('');
  };

  const onSubmit = async (data) => {
    try {
      // Validate content separately since it's not in the form
      const strippedContent = content.replace(/<[^>]*>/g, '').trim();
      if (!strippedContent || strippedContent.length < 100) {
        setError('Content must be at least 100 characters');
        return;
      }

      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Combine form data with rich text content
      const blogData = {
        ...data,
        content: content,
        tags: selectedTags.length > 0 ? selectedTags : [],
      };

      let response;
      if (editingBlog) {
        response = await contentService.updateBlog(editingBlog.id, blogData);
      } else {
        response = await contentService.createBlog(blogData);
      }
      
      if (response.data.success) {
        await fetchBlogs();
        setSuccess(`Blog ${editingBlog ? 'updated' : 'created'} successfully!`);
        handleCloseModal();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setError(error.response?.data?.error || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlog = async () => {
    try {
      if (!blogToDelete) return;
      
      await contentService.deleteBlog(blogToDelete.id);
      await fetchBlogs();
      setSuccess('Blog deleted successfully!');
      setDeleteConfirmOpen(false);
      setBlogToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog');
    }
  };

  const togglePublish = async (blog) => {
    try {
      const updatedBlog = { ...blog, published: !blog.published };
      await contentService.updateBlog(blog.id, { published: updatedBlog.published });
      await fetchBlogs();
      setSuccess(`Blog ${updatedBlog.published ? 'published' : 'unpublished'}!`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating publish status:', error);
      setError('Failed to update blog');
    }
  };

  const toggleTag = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
  };

  const getPublishedCount = () => {
    return blogs.filter(b => b.published).length;
  };

  const getDraftCount = () => {
    return blogs.filter(b => !b.published).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog content and articles</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Write New Post
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
          onRetry={fetchBlogs}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{getPublishedCount()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{getDraftCount()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <EyeOff className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tags Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(blogs.flatMap(b => b.tags || [])).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Posts</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by title, author, or tags..."
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
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Posts</option>
              <option value="published">Published Only</option>
              <option value="drafts">Drafts Only</option>
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
                onClick={fetchBlogs}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Blogs List */}
      {filteredBlogs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Get started by writing your first blog post'}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Write First Post
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Cover Image */}
                <div className="md:w-1/3">
                  {blog.cover_image ? (
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-full h-48 md:h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:w-2/3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {blog.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="w-4 h-4 mr-1" />
                        <span>{blog.author}</span>
                        <Clock className="w-4 h-4 ml-3 mr-1" />
                        <span>{formatDate(blog.published_at || blog.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(blog)}
                        className={`p-1.5 rounded-full ${
                          blog.published 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                        title={blog.published ? 'Unpublish' : 'Publish'}
                      >
                        {blog.published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-1.5 text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt || blog.content.substring(0, 150)}...
                  </p>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{blog.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Preview
                      </a>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        blog.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBlogToDelete(blog);
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Blog Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingBlog ? 'Edit Blog Post' : 'Write New Blog Post'}
        size="full"
        className="max-h-[90vh]"  
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Input
                label="Blog Title"
                placeholder="e.g., Mastering React Hooks in 2024"
                error={errors.title?.message}
                {...register('title')}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="URL Slug"
                  placeholder="e.g., mastering-react-hooks-2024"
                  error={errors.slug?.message}
                  {...register('slug')}
                  required
                />
                <Input
                  label="Author"
                  placeholder="Your Name"
                  error={errors.author?.message}
                  {...register('author')}
                  icon={User}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Content <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-96 text-black mb-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 100 characters required
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Image
                </label>
                {watch('cover_image') ? (
                  <div className="relative group">
                    <img
                      src={watch('cover_image')}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-white border-white hover:bg-white hover:text-black"
                        onClick={() => setImageModalOpen(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => setImageModalOpen(true)}
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">Upload Cover Image</p>
                    <p className="text-sm text-gray-500 mt-1">1200x630px recommended</p>
                  </div>
                )}
                <Input
                  className="mt-3"
                  placeholder="Cover image URL"
                  error={errors.cover_image?.message}
                  {...register('cover_image')}
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief summary for blog listings..."
                  {...register('excerpt')}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tags
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Click to select tags:
                </p>
                
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {tagOptions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="ml-2 hover:text-blue-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {watchPublished ? (
                    <Eye className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Publish Status</p>
                    <p className="text-sm text-gray-600">
                      {watchPublished ? 'Will be visible publicly' : 'Save as draft'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('published')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                </label>
              </div>

              {/* Status Info */}
              {editingBlog && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-sm text-blue-800">
                    <Calendar className="w-4 h-4 mr-2" />
                    <div>
                      <p>Created: {formatDate(editingBlog.created_at)}</p>
                      {editingBlog.published_at && (
                        <p className="mt-1">Published: {formatDate(editingBlog.published_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 sticky bottom-0 bg-white py-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingBlog ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Upload Cover Image"
        size="lg"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Drag & drop your cover image here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <Button type="button" variant="outline" className="mt-4">
              Browse Files
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Supports JPG, PNG, WebP • Max 5MB • Recommended: 1200x630px
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop',
              'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
              'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=1200&h=630&fit=crop',
              'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=630&fit=crop',
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
              'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop'
            ].map((url, i) => (
              <div
                key={i}
                className="aspect-video border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  setValue('cover_image', url);
                  setImageModalOpen(false);
                }}
              >
                <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Input
              placeholder="Or enter image URL directly"
              className="flex-1 mr-4"
              id="manual-image-url"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImageModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const urlInput = document.getElementById('manual-image-url');
                  if (urlInput && urlInput.value) {
                    setValue('cover_image', urlInput.value);
                  }
                  setImageModalOpen(false);
                }}
              >
                Use Image
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
          setBlogToDelete(null);
        }}
        title="Delete Blog Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{blogToDelete?.title}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone. All blog content will be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setBlogToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteBlog}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Blogs;
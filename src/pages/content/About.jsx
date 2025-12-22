import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Save, 
  Upload, 
  Image as ImageIcon,
  Link,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input } from '../../components/ui';
import { Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';
import mediaService from '../../services/media';


const aboutSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required').min(50, 'Description should be at least 50 characters'),
  email: yup.string().email('Invalid email format'),
  phone: yup.string(),
  location: yup.string(),
  cv_url: yup.string().url('Invalid URL format'),
  image_url: yup.string().url('Invalid URL format'),
});

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
     watch, // Add this
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: {
      title: '',
      description: '',
      email: '',
      phone: '',
      location: '',
      cv_url: '',
      image_url: '',
    }
  });

    const imageUrl = watch('image_url');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getAbout();
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setAboutData(data);
        reset({
          title: data.title || '',
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          cv_url: data.cv_url || '',
          image_url: data.image_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setError('Failed to load about information');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await contentService.updateAbout(data);
      
      if (response.data.success) {
        setAboutData(response.data.data);
        setSuccess('About information saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setError(error.response?.data?.error || 'Failed to save about information');
    } finally {
      setIsSaving(false);
    }
  };

const handleImageUpload = async (fileOrUrl) => {
    try {
      let finalImageUrl = fileOrUrl;
      
      // If it's a file object (from drag & drop or file input)
      if (fileOrUrl instanceof File) {
        setIsUploadingImage(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', fileOrUrl);
        formData.append('type', 'profile');
        
        // Upload to backend
        const response = await mediaService.uploadFile(formData);
        
        if (response.data.success) {
          finalImageUrl = response.data.data.upload.url;
          setSuccess('Profile image uploaded successfully!');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(response.data.error || 'Upload failed');
        }
      }
      
      // Update the form field
      setValue('image_url', finalImageUrl, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
      
      setImageModalOpen(false);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">About Section</h1>
          <p className="text-gray-600">Manage your personal information and bio</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Unsaved changes
            </span>
          )}
          <Button
            type="submit"
            form="about-form"
            variant="primary"
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
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
          onRetry={fetchAboutData}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image */}
        <div className="lg:col-span-1">
          <Card title="Profile Image">
            <div className="space-y-4">
              <div className="relative">
                {aboutData?.image_url ? (
                  <div className="relative group">
                    <img
                      src={aboutData.image_url}
                      alt="Profile"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
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
                    className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => setImageModalOpen(true)}
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">Upload Profile Image</p>
                    <p className="text-sm text-gray-500 mt-1">Click to select an image</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <span>Recommended: 400x400px, JPG or PNG</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setImageModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {aboutData?.image_url ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </Card>

          {/* CV Section */}
          <Card title="CV / Resume" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resume.pdf</p>
                    <p className="text-xs text-gray-500">Uploaded 2 days ago</p>
                  </div>
                </div>
                <a
                  href={aboutData?.cv_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Link className="w-4 h-4" />
                </a>
              </div>

              <Input
                label="CV URL"
                placeholder="https://yourdomain.com/cv.pdf"
                error={errors.cv_url?.message}
                {...register('cv_url')}
                icon={Link}
              />

              <p className="text-sm text-gray-600">
                Upload your CV to Google Drive or Dropbox and paste the public link here.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <Card>
            <form id="about-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Title / Headline"
                  placeholder="e.g., Full Stack Developer & Tech Enthusiast"
                  error={errors.title?.message}
                  {...register('title')}
                  required
                />

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Description / Bio <span className="text-red-500">*</span>
  </label>
  <textarea
    rows={6}
    className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      errors.description 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300'
    }`}
    placeholder="Write a compelling bio about yourself..."
    {...register('description')}
  />
  {errors.description && (
    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
  )}
  <p className="text-sm text-gray-500 mt-1">
    Write at least 2-3 paragraphs about your skills, experience, and passions.
  </p>
</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="hello@yourportfolio.com"
                    error={errors.email?.message}
                    {...register('email')}
                    icon={Mail}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    error={errors.phone?.message}
                    {...register('phone')}
                    icon={Phone}
                  />
                </div>

                <Input
                  label="Location"
                  placeholder="e.g., San Francisco, CA"
                  error={errors.location?.message}
                  {...register('location')}
                  icon={MapPin}
                />

                  <Input
    label="Profile Image URL"
    placeholder="https://yourdomain.com/images/profile.jpg"
    error={errors.image_url?.message}
    value={imageUrl || ''} // Make it controlled
    onChange={(e) => setValue('image_url', e.target.value, { shouldDirty: true })}
    icon={ImageIcon}
  />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    Last updated: {aboutData?.updated_at ? new Date(aboutData.updated_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isSaving}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    disabled={!isDirty || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Preview Section */}
          <Card title="Live Preview" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  This is how your about section will appear on the portfolio website.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchAboutData}
                >
                  Refresh Preview
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row gap-6">
                  {aboutData?.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={aboutData.image_url}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {aboutData?.title || 'Your Title Here'}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {aboutData?.description || 'Your description will appear here...'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {aboutData?.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {aboutData.email}
                        </div>
                      )}
                      {aboutData?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {aboutData.phone}
                        </div>
                      )}
                      {aboutData?.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {aboutData.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Upload Modal */}
{/* Image Upload Modal */}
<Modal
  isOpen={imageModalOpen}
  onClose={() => setImageModalOpen(false)}
  title="Upload Profile Image"
  size="lg"
>
  <div className="space-y-4">
    <label className="block">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
        }}
        onDrop={(e) => {
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
              // Direct upload to backend
              handleImageUpload(file);
            } else {
              alert('Please select an image file (JPG, PNG, WebP)');
            }
          }
        }}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Drag & drop your image here</p>
        <p className="text-sm text-gray-500 mt-1">or</p>
        <Button 
          type="button"
          variant="outline" 
          className="mt-4"
          onClick={() => document.getElementById('file-input')?.click()}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? 'Uploading...' : 'Browse Files'}
        </Button>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                return;
              }
              // Direct upload to backend
              handleImageUpload(file);
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-4">
          Supports JPG, PNG, WebP • Max 5MB
        </p>
      </div>
    </label>

    {/* Preset Images */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">Or choose from preset images:</p>
      <div className="grid grid-cols-3 gap-4">
        {[
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        ].map((url, index) => (
          <div
            key={index}
            className="aspect-square border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleImageUpload(url)}
          >
            <img 
              src={url} 
              alt={`Preset ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>

    {/* Manual URL Input */}
    <div className="flex items-center gap-3">
      <Input
        placeholder="Or enter image URL directly"
        className="flex-1"
        id="image-url-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value) {
            handleImageUpload(e.target.value);
          }
        }}
      />
      <Button
        variant="outline"
        onClick={() => {
          const urlInput = document.getElementById('image-url-input');
          if (urlInput?.value) {
            handleImageUpload(urlInput.value);
          }
        }}
      >
        Use URL
      </Button>
    </div>

    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={() => setImageModalOpen(false)}
        disabled={isUploadingImage}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          setImageModalOpen(false);
        }}
        disabled={isUploadingImage}
      >
        Close
      </Button>
    </div>
  </div>
</Modal>
    </div>
  );
};

export default About;
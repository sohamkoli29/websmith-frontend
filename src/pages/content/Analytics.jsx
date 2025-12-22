import React, { useState, useEffect } from 'react';
import {
  Eye, Users, FileText, Briefcase, Mail, Star, Clock, TrendingUp, TrendingDown,
  RefreshCw, Download, Activity, MessageSquare, Package, Award, Calendar
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import contentService from '../../services/content';

// Reusable Card Component
const Card = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

// Button Component
const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error Message
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-100 rounded-lg">
        <Activity className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <p className="text-red-900 font-medium">Error loading analytics</p>
        <p className="text-red-700 text-sm">{message}</p>
      </div>
    </div>
    <Button variant="outline" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  </div>
);

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  
  // Real data states from backend
  const [contentStats, setContentStats] = useState({
    projects: 0,
    blogs: 0,
    publishedBlogs: 0,
    skills: 0,
    testimonials: 0,
    experience: 0,
    services: 0,
    messages: 0,
    unreadMessages: 0
  });

  const [activityTimeline, setActivityTimeline] = useState([]);
  const [contentPerformance, setContentPerformance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [messageStats, setMessageStats] = useState([]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const filterByDateRange = (items, dateField = 'created_at') => {
    const end = new Date();
    const start = new Date();
    
    switch(timeRange) {
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case '1year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch ALL real content from backend
      const [
        projectsRes, 
        blogsRes, 
        testimonialsRes, 
        experienceRes,
        servicesRes,
        skillsRes,
        messagesRes
      ] = await Promise.all([
        contentService.getProjects(),
        contentService.getBlogs(),
        contentService.getTestimonials(),
        contentService.getExperiences(),
        contentService.getServices(),
        contentService.getSkills(),
        contentService.getMessages()
      ]);

      const projects = projectsRes.data.data || [];
      const blogs = blogsRes.data.data || [];
      const testimonials = testimonialsRes.data.data || [];
      const experience = experienceRes.data.data || [];
      const services = servicesRes.data.data || [];
      const skills = skillsRes.data.data || [];
      const messages = messagesRes.data.data || [];

      // Calculate real content stats
      const publishedBlogs = blogs.filter(b => b.published).length;
      const unreadMessages = messages.filter(m => !m.read).length;
      
      setContentStats({
        projects: projects.length,
        blogs: blogs.length,
        publishedBlogs: publishedBlogs,
        skills: skills.length,
        testimonials: testimonials.length,
        experience: experience.length,
        services: services.length,
        messages: messages.length,
        unreadMessages: unreadMessages
      });

      // Generate activity timeline based on REAL content creation dates
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
      const timeline = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Count ACTUAL content created on this date
        const projectsCreated = projects.filter(p => 
          new Date(p.created_at).toISOString().split('T')[0] === dateStr
        ).length;
        
        const blogsCreated = blogs.filter(b => 
          new Date(b.created_at).toISOString().split('T')[0] === dateStr
        ).length;
        
        const messagesReceived = messages.filter(m => 
          new Date(m.created_at).toISOString().split('T')[0] === dateStr
        ).length;

        const testimonialsAdded = testimonials.filter(t => 
          new Date(t.created_at).toISOString().split('T')[0] === dateStr
        ).length;

        const totalActivity = projectsCreated + blogsCreated + messagesReceived + testimonialsAdded;
        
        timeline.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          projects: projectsCreated,
          blogs: blogsCreated,
          messages: messagesReceived,
          testimonials: testimonialsAdded,
          totalActivity: totalActivity
        });
      }
      setActivityTimeline(timeline);

      // Real content performance based on actual counts
      const allContentItems = [
        ...projects.map(p => ({ ...p, type: 'project' })),
        ...blogs.map(b => ({ ...b, type: 'blog' })),
        ...testimonials.map(t => ({ ...t, type: 'testimonial' })),
        ...experience.map(e => ({ ...e, type: 'experience' }))
      ];

      const performance = [
        { 
          category: 'Projects',     
          total: projects.length,
          featured: projects.filter(p => p.featured).length,
          recent: filterByDateRange(projects).length
        },
        { 
          category: 'Blog Posts', 
          total: blogs.length,
          featured: publishedBlogs,
          recent: filterByDateRange(blogs).length
        },
        { 
          category: 'Testimonials', 
          total: testimonials.length,
          featured: testimonials.filter(t => t.featured).length,
          recent: filterByDateRange(testimonials).length
        },
        { 
          category: 'Experience', 
          total: experience.length,
          featured: experience.filter(e => e.current).length || 0,
          recent: filterByDateRange(experience).length
        },
        { 
          category: 'Services', 
          total: services.length,
          featured: services.length,
          recent: 0
        },
      ];
      setContentPerformance(performance);

      // Top recent content
      const sortedProjects = [...projects]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      const sortedBlogs = [...blogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const topItems = [
        ...sortedProjects.map(p => ({ 
          title: p.title, 
          type: 'Project',
          date: p.created_at,
          featured: p.featured,
          technologies: p.technologies?.length || 0
        })),
        ...sortedBlogs.map(b => ({ 
          title: b.title, 
          type: 'Blog',
          date: b.created_at,
          featured: b.published,
          tags: b.tags?.length || 0
        }))
      ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
      
      setTopContent(topItems);

      // Message statistics by day
      const messagesByDay = {};
      messages.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        messagesByDay[date] = (messagesByDay[date] || 0) + 1;
      });

      const msgStats = Object.entries(messagesByDay)
        .map(([date, count]) => ({ date, count }))
        .slice(-30);

      setMessageStats(msgStats);

      // Recent activities from actual data
      const activities = [];
      
      // Recent messages
      messages
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
        .forEach(msg => {
          activities.push({
            action: 'New Message',
            detail: `From ${msg.name}`,
            subject: msg.subject || msg.message?.substring(0, 50) + '...',
            time: formatTimeAgo(msg.created_at),
            timestamp: new Date(msg.created_at),
            icon: Mail,
            read: msg.read
          });
        });
      
      // Recent blogs
      blogs
        .filter(b => b.published)
        .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
        .slice(0, 2)
        .forEach(blog => {
          activities.push({
            action: 'Blog Published',
            detail: blog.title,
            subject: `by ${blog.author}`,
            time: formatTimeAgo(blog.published_at || blog.created_at),
            timestamp: new Date(blog.published_at || blog.created_at),
            icon: FileText
          });
        });

      // Recent projects
      projects
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 2)
        .forEach(project => {
          activities.push({
            action: 'Project Added',
            detail: project.title,
            subject: project.featured ? '⭐ Featured' : '',
            time: formatTimeAgo(project.created_at),
            timestamp: new Date(project.created_at),
            icon: Briefcase
          });
        });

      // Recent testimonials
      testimonials
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 1)
        .forEach(testimonial => {
          activities.push({
            action: 'Testimonial',
            detail: `From ${testimonial.name}`,
            subject: testimonial.company || testimonial.role,
            time: formatTimeAgo(testimonial.created_at),
            timestamp: new Date(testimonial.created_at),
            icon: Star
          });
        });

      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data from backend');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real data from your portfolio backend</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={fetchAnalyticsData} />}

      {/* Quick Overview - Real Backend Data */}
      <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Content Portfolio</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Projects</span>
                <span className="font-bold">{contentStats.projects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Blog Posts</span>
                <span className="font-bold">{contentStats.blogs} ({contentStats.publishedBlogs} published)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Skills</span>
                <span className="font-bold">{contentStats.skills}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Engagement</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Total Messages</span>
                <span className="font-bold">{contentStats.messages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Unread Messages</span>
                <span className="font-bold text-yellow-300">{contentStats.unreadMessages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Testimonials</span>
                <span className="font-bold">{contentStats.testimonials}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-2">Experience</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Total Content</span>
                <span className="font-bold">{contentStats.projects + contentStats.blogs + contentStats.testimonials}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Work Experience</span>
                <span className="font-bold">{contentStats.experience}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Services</span>
                <span className="font-bold">{contentStats.services}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics - Real Backend Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3  rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Total Projects</p>
            <p className="text-3xl font-bold">{contentStats.projects}</p>
            <p className="text-sm opacity-90 mt-2">Portfolio showcase</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3  rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Blog Posts</p>
            <p className="text-3xl font-bold">{contentStats.publishedBlogs}</p>
            <p className="text-sm opacity-90 mt-2">{contentStats.blogs} total ({contentStats.blogs - contentStats.publishedBlogs} drafts)</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
              <Mail className="w-6 h-6" />
            </div>
            {contentStats.unreadMessages > 0 && (
              <div className="px-2 py-1 bg-yellow-400 text-purple-900 rounded-full text-xs font-bold">
                {contentStats.unreadMessages} new
              </div>
            )}
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Messages</p>
            <p className="text-3xl font-bold">{contentStats.messages}</p>
            <p className="text-sm opacity-90 mt-2">Contact submissions</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3  rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Testimonials</p>
            <p className="text-3xl font-bold">{contentStats.testimonials}</p>
            <p className="text-sm opacity-90 mt-2">Client feedback</p>
          </div>
        </Card>
      </div>

      {/* Activity Timeline & Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card title="Activity Timeline" subtitle="Content creation over time">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline}>
                <defs>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="projects" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProjects)" name="Projects" />
                <Area type="monotone" dataKey="blogs" stroke="#10B981" fillOpacity={1} fill="url(#colorBlogs)" name="Blogs" />
                <Area type="monotone" dataKey="messages" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorMessages)" name="Messages" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Content Performance */}
        <Card title="Content Performance" subtitle="Distribution across categories">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={contentPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar name="Total" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Featured" dataKey="featured" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Radar name="Recent" dataKey="recent" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Content & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recent Content */}
        <Card title="Recent Content" subtitle="Latest additions to your portfolio">
          <div className="space-y-3">
            {topContent.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No content yet</p>
                <p className="text-sm text-gray-500 mt-1">Start adding projects and blogs</p>
              </div>
            ) : (
              topContent.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.type === 'Project' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {item.type === 'Project' ? 
                        <Briefcase className={`w-4 h-4 ${item.type === 'Project' ? 'text-blue-600' : 'text-green-600'}`} /> :
                        <FileText className={`w-4 h-4 ${item.type === 'Project' ? 'text-blue-600' : 'text-green-600'}`} />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.type} • {formatTimeAgo(item.date)}</p>
                    </div>
                  </div>
                  {item.featured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Latest interactions and updates">
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">Activity will appear here</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.detail} • {activity.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Message Statistics */}
      {messageStats.length > 0 && (
        <Card title="Message Activity" subtitle="Contact form submissions over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
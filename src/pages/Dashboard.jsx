import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Briefcase, 
  MessageSquare,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  Activity,
  Download,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card } from '../components/ui';
import contentService from '../services/content';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const statsResponse = await contentService.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent activities from multiple sources
      await fetchRecentActivities();
      
      // Generate chart data
      await generateChartData();
      
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities = [];
      
      // Fetch recent projects
      const projectsResponse = await contentService.getProjects();
      if (projectsResponse.data.success) {
        const recentProjects = projectsResponse.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2);
        
        recentProjects.forEach(project => {
          activities.push({
            id: `project-${project.id}`,
            user: 'Admin',
            action: `created project "${project.title}"`,
            time: formatTimeAgo(project.created_at),
            timestamp: new Date(project.created_at),
            type: 'project'
          });
        });
      }

      // Fetch recent blogs
      const blogsResponse = await contentService.getBlogs();
      if (blogsResponse.data.success) {
        const recentBlogs = blogsResponse.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2);
        
        recentBlogs.forEach(blog => {
          activities.push({
            id: `blog-${blog.id}`,
            user: blog.author || 'Admin',
            action: blog.published 
              ? `published blog "${blog.title}"`
              : `created blog draft "${blog.title}"`,
            time: formatTimeAgo(blog.created_at),
            timestamp: new Date(blog.created_at),
            type: 'blog'
          });
        });
      }

      // Fetch recent messages
      const messagesResponse = await contentService.getMessages();
      if (messagesResponse.data.success) {
        const recentMessages = messagesResponse.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2);
        
        recentMessages.forEach(message => {
          activities.push({
            id: `message-${message.id}`,
            user: message.name,
            action: `sent a message`,
            time: formatTimeAgo(message.created_at),
            timestamp: new Date(message.created_at),
            type: 'message'
          });
        });
      }

      // Fetch recent testimonials
      const testimonialsResponse = await contentService.getTestimonials();
      if (testimonialsResponse.data.success) {
        const recentTestimonials = testimonialsResponse.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 1);
        
        recentTestimonials.forEach(testimonial => {
          activities.push({
            id: `testimonial-${testimonial.id}`,
            user: testimonial.name,
            action: `left a testimonial`,
            time: formatTimeAgo(testimonial.created_at),
            timestamp: new Date(testimonial.created_at),
            type: 'testimonial'
          });
        });
      }

      // Sort by timestamp and take top 5
      const sortedActivities = activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const generateChartData = async () => {
    try {
      // Fetch all content to generate statistics
      const [projects, blogs, messages, skills] = await Promise.all([
        contentService.getProjects(),
        contentService.getBlogs(),
        contentService.getMessages(),
        contentService.getSkills()
      ]);

      // Generate monthly data for the last 6 months
      const monthlyData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Count items created in this month
        const projectsCount = projects.data.data?.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthStart && itemDate <= monthEnd;
        }).length || 0;

        const blogsCount = blogs.data.data?.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthStart && itemDate <= monthEnd;
        }).length || 0;

        const messagesCount = messages.data.data?.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthStart && itemDate <= monthEnd;
        }).length || 0;

        monthlyData.push({
          month: `${monthName} ${year.toString().slice(-2)}`,
          projects: projectsCount,
          blogs: blogsCount,
          messages: messagesCount,
          total: projectsCount + blogsCount + messagesCount
        });
      }

      setChartData(monthlyData);
    } catch (error) {
      console.error('Error generating chart data:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.counts?.projects || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      description: 'From last month',
    },
    {
      title: 'Published Blogs',
      value: stats?.counts?.blogs || 0,
      icon: FileText,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
      description: 'From last month',
    },
    {
      title: 'Unread Messages',
      value: stats?.counts?.unreadMessages || 0,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      trend: '-3%',
      trendUp: false,
      description: 'From last week',
    },
    {
      title: 'Total Skills',
      value: stats?.counts?.skills || 0,
      icon: Activity,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true,
      description: 'From last month',
    },
  ];

  const quickActions = [
    { title: 'Add New Project', icon: Briefcase, path: '/projects', color: 'bg-blue-100 text-blue-600' },
    { title: 'Write Blog Post', icon: FileText, path: '/blogs', color: 'bg-green-100 text-green-600' },
    { title: 'Upload Media', icon: Eye, path: '/media', color: 'bg-purple-100 text-purple-600' },
    { title: 'View Messages', icon: MessageSquare, path: '/messages', color: 'bg-yellow-100 text-yellow-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{stat.description}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Card */}
        <div className="lg:col-span-2">
          <Card title="Performance Overview" subtitle="Last 6 months">
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Projects"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="blogs" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Blogs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Messages"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading chart data...</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={index}
                  href={action.path}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`${action.color} p-2 rounded-lg mr-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{action.title}</p>
                  </div>
                  <ArrowUp className="w-4 h-4 text-gray-400 transform rotate-45 group-hover:text-blue-600 transition-colors" />
                </a>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card 
        title="Recent Activity" 
        subtitle="Latest actions in your CMS"
        headerActions={
          <button 
            onClick={fetchRecentActivities}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        }
      >
        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activity will appear here as you manage your content</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {activity.user.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type === 'project' 
                          ? 'bg-blue-100 text-blue-800'
                          : activity.type === 'blog'
                          ? 'bg-green-100 text-green-800'
                          : activity.type === 'message'
                          ? 'bg-yellow-100 text-yellow-800'
                          : activity.type === 'testimonial'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Messages Preview */}
      {stats?.recent?.messages && stats.recent.messages.length > 0 && (
        <Card 
          title="Recent Messages" 
          className="mt-6"
          headerActions={
            <a href="/messages" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Messages
            </a>
          }
        >
          <div className="space-y-4">
            {stats.recent.messages.slice(0, 3).map((message, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{message.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{message.message?.substring(0, 100)}...</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.read 
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-gray-500">{message.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
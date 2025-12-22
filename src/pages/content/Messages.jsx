import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  User, 
  Calendar, 
  Eye, 
  EyeOff,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Reply,
  Star,
  Archive,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Button, Input, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import contentService from '../../services/content';
import { useMessages } from '../../context/MessagesContext';
const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
    const { unreadCount, resetUnreadCount } = useMessages();

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter messages when search term or filter changes
  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, selectedFilter]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getMessages();
      
      if (response.data.success) {
        setMessages(response.data.data || []);
        setFilteredMessages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedFilter === 'unread') {
      filtered = filtered.filter(message => !message.read);
    } else if (selectedFilter === 'read') {
      filtered = filtered.filter(message => message.read);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setFilteredMessages(filtered);
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessages(prev =>
      prev.includes(id)
        ? prev.filter(messageId => messageId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await contentService.updateMessage(messageId, { read: true });
      await fetchMessages();
      setSuccess('Message marked as read');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError('Failed to update message');
    }
  };

  const markAsUnread = async (messageId) => {
    try {
      await contentService.updateMessage(messageId, { read: false });
      await fetchMessages();
      setSuccess('Message marked as unread');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error marking message as unread:', error);
      setError('Failed to update message');
    }
  };

  const handleDeleteMessage = async () => {
    try {
      if (!messageToDelete) return;
      
      await contentService.deleteMessage(messageToDelete.id);
      await fetchMessages();
      setSuccess('Message deleted successfully!');
      setDeleteModalOpen(false);
      setMessageToDelete(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedMessages) {
        await contentService.deleteMessage(id);
      }
      await fetchMessages();
      setSuccess(`Deleted ${selectedMessages.length} message(s) successfully!`);
      setSelectedMessages([]);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting messages:', error);
      setError('Failed to delete messages');
    }
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      for (const id of selectedMessages) {
        await contentService.updateMessage(id, { read: true });
      }
      await fetchMessages();
      setSuccess(`Marked ${selectedMessages.length} message(s) as read`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      setError('Failed to update messages');
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setViewModalOpen(true);
    
    // Mark as read when viewing
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getUnreadCount = () => {
    return messages.filter(m => !m.read).length;
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
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Manage contact form submissions and inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchMessages}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
          onRetry={fetchMessages}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{getUnreadCount()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <EyeOff className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => {
                  const messageDate = new Date(m.created_at);
                  const today = new Date();
                  return messageDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => {
                  const messageDate = new Date(m.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return messageDate >= weekAgo;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMessages.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedMessages.length} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'All messages will appear here when received'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Select all ({filteredMessages.length})
              </span>
            </div>
          </div>

          {/* Messages */}
          {filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => toggleSelectMessage(message.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {message.name}
                        </h3>
                        {!message.read && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{message.email}</p>
                      {message.subject && (
                        <p className="text-sm font-medium text-gray-800 mt-2">{message.subject}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mt-3 line-clamp-2">
                    {message.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => message.read ? markAsUnread(message.id) : markAsRead(message.id)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        message.read 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {message.read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                    <button
                      onClick={() => {
                        setMessageToDelete(message);
                        setDeleteModalOpen(true);
                      }}
                      className="text-xs px-3 py-1 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Message Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-6">
            {/* Message Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedMessage.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Subject</h4>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{selectedMessage.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => selectedMessage.read ? markAsUnread(selectedMessage.id) : markAsRead(selectedMessage.id)}
              >
                {selectedMessage.read ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {selectedMessage.read ? 'Mark as Unread' : 'Mark as Read'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReplyModalOpen(true);
                  setViewModalOpen(false);
                }}
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setViewModalOpen(false);
                  setMessageToDelete(selectedMessage);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        title={selectedMessages.length > 0 ? "Delete Messages" : "Delete Message"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {selectedMessages.length > 0 
              ? `Are you sure you want to delete ${selectedMessages.length} selected message(s)?`
              : `Are you sure you want to delete the message from ${messageToDelete?.name}?`
            }
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={selectedMessages.length > 0 ? handleDeleteSelected : handleDeleteMessage}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title={`Reply to ${selectedMessage?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <Input
              value={selectedMessage?.email || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              defaultValue={`Re: ${selectedMessage?.subject || 'Your message'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={6}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setReplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // Here you would integrate with email sending API
                alert('Reply functionality would send email here');
                setReplyModalOpen(false);
                setReplyContent('');
              }}
              disabled={!replyContent.trim()}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages;
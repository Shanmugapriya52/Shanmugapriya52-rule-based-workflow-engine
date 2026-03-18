import { useState, useEffect, createContext, useContext } from 'react';
import api from '../api/axios';


// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Real-time Notification Service
export class NotificationService {
  constructor() {
    this.subscribers = [];
    this.notifications = [];
    this.ws = null;
    this.pollingInterval = null;
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  // Notify all subscribers
  notify(notification) {
    this.subscribers.forEach(callback => callback(notification));
  }

  // Send notification to specific users
  async sendNotification(notification) {
    try {
      // Send to backend API
      const response = await api.post('/notifications', notification);
      const result = response.data;
      
      // Add to local notifications
      this.notify({
        ...notification,
        _id: result._id || result.id || `notif-${Date.now()}`,
        id: result._id || result.id || `notif-${Date.now()}`,
        created_at: new Date().toISOString(),
        read: false
      });

      return result;
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Fallback to local notification
      const localId = `notif-${Date.now()}`;
      this.notify({
        ...notification,
        _id: localId,
        id: localId,
        created_at: new Date().toISOString(),
        read: false
      });
    }
  }

  // Get notifications for current user
  async getUserNotifications() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser._id) return [];
      const response = await api.get(`/notifications/user/${currentUser._id}`);
      
      const notifications = response.data;
      this.notifications = notifications;
      return notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
    
    return this.notifications;
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      // Update local state
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification) {
        notification.read = true;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Start real-time updates
  startRealTimeUpdates() {
    // WebSocket connection for real-time updates- disabled for now to avoid complexity
    // this.startPolling();
  }

  // Fallback polling mechanism
  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.getUserNotifications();
    }, 10000); // Poll every 10 seconds for user feel
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notificationService] = useState(() => new NotificationService());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for new incoming notifications
      setActiveToast({
        message: notification.message,
        type: notification.type || 'info',
        id: notification._id || notification.id
      });
    });

    const refresh = async () => {
      const initialNotifications = await notificationService.getUserNotifications();
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read).length);

      // Fetch approval count
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const params = {};
        if (currentUser?._id && currentUser._id !== "null") params.userId = currentUser._id;
        if (currentUser?.username) params.username = currentUser.username;
        if (!params.userId && !params.username) return;
        
        const res = await api.get('/executions/my-approvals', { params });
        if (res.data.success) {
          setApprovalCount(res.data.executions?.length || 0);
        }
      } catch (err) {
        console.error('Failed to fetch approval count:', err);
      }
    };

    refresh();
    const interval = setInterval(refresh, 10000);

    // Bootstrap automation engine
    import('../services/NotificationService').then(({ automationEngine }) => {
      automationEngine.bootstrap();
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const sendNotification = async (notification) => {
    await notificationService.sendNotification(notification);
  };

  const markAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      approvalCount,
      activeToast,
      setActiveToast,
      sendNotification,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Automation Engine
export class AutomationEngine {
  constructor() {
    this.rules = [];
    this.workflows = [];
    this.eventListeners = [];
    this.initialized = false;
  }

  // Bootstrap rules from database
  async bootstrap() {
    try {
      const response = await api.get('/automation-rules');
      this.rules = Array.isArray(response.data) ? response.data.filter(r => r.enabled) : [];
      this.initialized = true;
      console.log(`Automation engine initialized with ${this.rules.length} rules`);
    } catch (error) {
      console.error('Failed to bootstrap automation rules:', error);
    }
  }

  // Register automation rule manually (for tests or dynamic rules)
  registerRule(rule) {
    this.rules.push(rule);
  }

  // Execute automation based on event
  async executeAutomation(event) {
    const matchingRules = this.rules.filter(rule => 
      rule.trigger === event.type && this.evaluateConditions(rule.conditions, event.data)
    );

    for (const rule of matchingRules) {
      try {
        await this.executeActions(rule.actions, event.data);
      } catch (error) {
        console.error('Automation execution failed:', error);
      }
    }
  }

  // Evaluate rule conditions
  evaluateConditions(conditions, data) {
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const fieldValue = this.getFieldValue(data, field);
      
      switch (operator) {
        case 'equals': return fieldValue === value;
        case 'not_equals': return fieldValue !== value;
        case 'greater_than': return fieldValue > value;
        case 'less_than': return fieldValue < value;
        case 'contains': return fieldValue.includes(value);
        default: return true;
      }
    });
  }

  // Get nested field value
  getFieldValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Execute automation actions
  async executeActions(actions, eventData) {
    for (const action of actions) {
      switch (action.type) {
        case 'send_notification':
          await this.sendAutomatedNotification(action, eventData);
          break;
        case 'create_page':
          await this.createDynamicPage(action, eventData);
          break;
        case 'trigger_workflow':
          await this.triggerWorkflow(action, eventData);
          break;
        case 'update_data':
          await this.updateData(action, eventData);
          break;
      }
    }
  }

  // Send automated notification
  async sendAutomatedNotification(action, eventData) {
    const notificationService = new NotificationService();
    
    const notification = {
      title: action.title,
      message: this.replaceTemplateVariables(action.message, eventData),
      type: action.notification_type || 'info',
      recipients: this.resolveRecipients(action.recipients, eventData),
      priority: action.priority || 'medium'
    };

    await notificationService.sendNotification(notification);
  }

  // Create dynamic page based on template
  async createDynamicPage(action, eventData) {
    const pageTemplate = action.template;
    const pageData = {
      ...eventData,
      created_at: new Date().toISOString(),
      template_id: action.template_id
    };

    // Create page configuration
    const pageConfig = {
      id: `page-${Date.now()}`,
      title: this.replaceTemplateVariables(pageTemplate.title, eventData),
      type: action.page_type,
      template: pageTemplate,
      data: pageData,
      created_for: this.resolveRecipients(action.recipients, eventData),
      created_by: 'automation'
    };

    // Save to backend
    try {
      await api.post('/dynamic-pages', pageConfig);
      console.log('Dynamic page created successfully');
    } catch (error) {
      console.error('Failed to create dynamic page:', error);
    }
  }

  // Trigger workflow automatically
  async triggerWorkflow(action, eventData) {
    const workflowData = {
      workflow_id: action.workflow_id,
      triggered_by: 'automation',
      trigger_data: eventData,
      priority: action.priority || 'normal'
    };

    try {
      await api.post('/workflows/execute', workflowData);
      console.log('Workflow triggered successfully');
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  }

  // Update data automatically
  async updateData(action, eventData) {
    try {
      await api.put(`/${action.endpoint}`, {
        ...action.data,
        ...eventData
      });
      console.log('Data updated successfully');
    } catch (error) {
      console.error('Failed to update data:', error);
    }
  }

  // Replace template variables
  replaceTemplateVariables(template, data) {
    if (!template) return '';
    return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      const value = this.getFieldValue(data, path);
      return value !== undefined ? value : match;
    });
  }

  // Resolve notification recipients
  resolveRecipients(recipients, eventData) {
    if (recipients === 'trigger_user') {
      // Try multiple common user ID locations
      const userId = this.getFieldValue(eventData, 'user_id') || 
                     this.getFieldValue(eventData, 'user.id') || 
                     this.getFieldValue(eventData, 'user._id') || 
                     this.getFieldValue(eventData, 'id');
      return userId ? [userId] : [];
    } else if (recipients === 'role_based') {
      return eventData.roles || [];
    } else if (Array.isArray(recipients)) {
      return recipients;
    }
    return [];
  }
}

// Global automation engine instance
export const automationEngine = new AutomationEngine();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const workflowRoutes = require('./routes/workflows');
const stepRoutes = require('./routes/steps');
const ruleRoutes = require('./routes/rules');
const executionRoutes = require('./routes/executions');
const userRoutes = require('./routes/users');
const automationRuleRoutes = require('./routes/automationRules');
const notificationRoutes = require('./routes/notifications');
const dashboardConfigRoutes = require('./routes/dashboardConfigs');
const authRoutes = require('./routes/auth');

const app = express();
app.set('etag', false); // Disable ETags to prevent 304 responses

// CORS configuration - Moved up and improved
app.use(cors({
  origin: '*', // Temporarily allow all for debugging if needed, but keeping it focused
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id', 'X-Organization-Id', 'x-organization-name', 'X-Organization-Name']
}));

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// Logging - Only log errors (4xx and 5xx) to reduce noise in the terminal
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Disable caching for all routes to prevent 304 responses in development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/workflows', workflowRoutes);
app.use('/api', stepRoutes); // steps.js defines routes starting with /workflows/:workflow_id/steps or /steps/:id
app.use('/api', ruleRoutes); // rules.js defines routes starting with /steps/:step_id/rules or /rules/:id
app.use('/api', executionRoutes); // Mixed with /executions correctly from executions.js
app.use('/api/users', userRoutes);
app.use('/api/automation-rules', automationRuleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard-configs', dashboardConfigRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Halleyx Workflow Automation API',
    version: '1.0.0',
    endpoints: {
      workflows: '/api/workflows',
      health: '/health'
    },
    methods: {
      workflows: {
        POST: '/api/workflows - Create workflow',
        GET: '/api/workflows - List workflows (pagination & search)',
        GET: '/api/workflows/:id - Get workflow details including steps & rules',
        PUT: '/api/workflows/:id - Update workflow (creates new version)',
        DELETE: '/api/workflows/:id - Delete workflow'
      },
      steps: {
        POST: '/api/workflows/:workflow_id/steps - Add step',
        GET: '/api/workflows/:workflow_id/steps - List steps for workflow',
        PUT: '/api/steps/:id - Update step',
        DELETE: '/api/steps/:id - Delete step'
      },
      rules: {
        POST: '/api/steps/:step_id/rules - Add rule',
        GET: '/api/steps/:step_id/rules - List rules for step',
        PUT: '/api/rules/:id - Update rule',
        DELETE: '/api/rules/:id - Delete rule'
      },
      executions: {
        POST: '/api/workflows/:workflow_id/execute - Start workflow execution',
        GET: '/api/executions/:id - Get execution status & logs',
        POST: '/api/executions/:id/cancel - Cancel execution',
        POST: '/api/executions/:id/retry - Retry failed step',
        GET: '/api/executions - List executions with filters'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.message
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate entry',
      details: 'A record with this identifier already exists'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Halleyx Workflow Automation Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🕐 Started at: ${new Date().toLocaleString()}
📊 MongoDB: Connected
🔗 API Base URL: http://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;

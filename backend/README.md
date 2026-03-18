# Halleyx Workflow Automation Backend

## Overview

This is the backend API for the Halleyx Workflow Automation System, built with Node.js, Express, and MongoDB.

## Features

- **Workflow Management**: Create, read, update, and delete workflows
- **Step Management**: Define workflow steps with different types (task, approval, notification)
- **Rule Engine**: Create conditional rules to determine workflow flow
- **Execution Engine**: Execute workflows with real-time tracking
- **Audit Logging**: Complete execution history and compliance tracking
- **RESTful API**: Well-documented API endpoints
- **Database Integration**: MongoDB with Mongoose ODM

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication (prepared)
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Compression** - Response compression

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/halleyx_workflow
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:5174
   ```

3. **Start MongoDB**:
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

4. **Run the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Workflows

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/workflows` | List workflows (pagination & search) |
| GET | `/api/workflows/:id` | Get workflow details with steps & rules |
| POST | `/api/workflows` | Create new workflow |
| PUT | `/api/workflows/:id` | Update workflow (creates new version) |
| DELETE | `/api/workflows/:id` | Delete workflow |
| POST | `/api/workflows/:id/execute` | Start workflow execution |

### Executions

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/executions` | List executions (filters & pagination) |
| GET | `/api/executions/:id` | Get execution status & logs |
| POST | `/api/executions/:id/cancel` | Cancel execution |
| POST | `/api/executions/:id/retry` | Retry failed execution |

### System

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |

## Database Schema

### Workflow

```javascript
{
  id: String (unique, auto-generated),
  name: String (required),
  description: String,
  version: Number (default: 1),
  is_active: Boolean (default: true),
  input_schema: {
    type: Mixed,
    fields: [{
      name: String,
      type: String,
      required: Boolean,
      allowed_values: [String]
    }]
  },
  start_step_id: String (required),
  created_at: Date,
  updated_at: Date,
  created_by: String
}
```

### Step

```javascript
{
  id: String (unique, auto-generated),
  workflow_id: String (required),
  name: String (required),
  step_type: String (enum: ['task', 'approval', 'notification']),
  order: Number (required),
  metadata: Mixed,
  created_at: Date,
  updated_at: Date
}
```

### Rule

```javascript
{
  id: String (unique, auto-generated),
  step_id: String (required),
  condition: String (required),
  next_step_id: String,
  priority: Number (required),
  created_at: Date,
  updated_at: Date
}
```

### Execution

```javascript
{
  id: String (unique, auto-generated),
  workflow_id: String (required),
  workflow_version: Number (required),
  status: String (enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled']),
  data: Mixed,
  logs: [{
    step_name: String,
    step_type: String,
    evaluated_rules: [{ rule: String, result: Boolean }],
    selected_next_step: String,
    status: String,
    approver_id: String,
    error_message: String,
    started_at: Date,
    ended_at: Date,
    duration: Number
  }],
  current_step_id: String,
  retries: Number,
  triggered_by: String,
  started_at: Date,
  ended_at: Date
}
```

## Usage Examples

### Create a Workflow

```javascript
const workflowData = {
  name: "Expense Approval",
  description: "Multi-level expense approval workflow",
  input_schema: {
    fields: [
      { name: "amount", type: "number", required: true },
      { name: "country", type: "string", required: true },
      { name: "priority", type: "string", required: true, allowed_values: ["High", "Medium", "Low"] }
    ]
  },
  start_step_id: "step-001",
  steps: [
    {
      name: "Manager Approval",
      step_type: "approval",
      order: 1,
      metadata: {
        assignee_email: "manager@example.com",
        instructions: "Review and approve expense request"
      },
      rules: [
        {
          condition: 'amount > 100 && country == "US" && priority == "High"',
          next_step_id: "step-002",
          priority: 1
        }
      ]
    }
  ],
  created_by: "admin"
};

fetch('/api/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workflowData)
});
```

### Execute a Workflow

```javascript
const executionData = {
  data: {
    amount: 250,
    country: "US",
    priority: "High"
  },
  triggered_by: "user123"
};

fetch('/api/workflows/workflow-001/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(executionData)
});
```

## Development

### Running Tests

```bash
npm test
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/halleyx_workflow |
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| JWT_SECRET | JWT secret key | (required) |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5174 |
| LOG_LEVEL | Logging level | info |

## Deployment

1. **Set environment variables** for production
2. **Install dependencies**: `npm ci`
3. **Start MongoDB** with proper security
4. **Run server**: `npm start`

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Configured cross-origin access
- **Input validation**: Joi schema validation
- **Rate limiting**: Prepared for implementation
- **Error handling**: Sanitized error responses

## Performance Features

- **Compression**: Gzip response compression
- **Database indexes**: Optimized queries
- **Pagination**: Efficient data loading
- **Caching**: Prepared for Redis integration

## Monitoring

- **Health endpoint**: `/health`
- **Request logging**: Morgan middleware
- **Error tracking**: Comprehensive error handling
- **Performance metrics**: Response time tracking

## License

MIT License - see LICENSE file for details

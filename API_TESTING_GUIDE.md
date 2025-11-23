# API Testing Guide

## Overview
This guide provides curl examples and test cases for all backend CRUD APIs in `/app/api/v1/`.

---

## 1. Init-User API

### Endpoint
```
POST /api/v1/init-user
```

### ✅ Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/init-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://avatar.example.com/john.jpg"
  }'
```

### ❌ Invalid Requests (should fail)

**Missing Name**:
```bash
curl -X POST http://localhost:3000/api/v1/init-user \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
# Expected: 400 - Name and Email are required
```

**Invalid Email Format**:
```bash
curl -X POST http://localhost:3000/api/v1/init-user \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "invalid-email"}'
# Expected: 400 - Invalid email format
```

**Duplicate Email**:
```bash
curl -X POST http://localhost:3000/api/v1/init-user \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane", "email": "john@example.com"}'
# Expected: 409 - User with this email already exists
```

---

## 2. Departments API

### Create Department
```
POST /api/v1/departments
```

#### ✅ Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "name": "Engineering",
    "type": "Technical",
    "description": "Engineering team",
    "professionalDetails": "Responsible for development",
    "employees": []
  }'
```

#### ❌ Invalid Requests

**Empty Name** (should fail now):
```bash
curl -X POST http://localhost:3000/api/v1/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"name": "   ", "type": "Technical"}'
# Expected: 400 - Department name required
```

### Get Departments
```
GET /api/v1/departments
```

```bash
curl -X GET http://localhost:3000/api/v1/departments \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Update Department
```
PUT /api/v1/departments
```

#### ✅ Valid Request
```bash
curl -X PUT http://localhost:3000/api/v1/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "departmentId": "uuid-here",
    "name": "Engineering (Updated)",
    "type": "Technical",
    "description": "Updated description",
    "professionalDetails": "Updated details",
    "employeeEmails": ["emp1@example.com", "emp2@example.com"]
  }'
```

#### ❌ Invalid Requests

**Missing employeeEmails** (should fail now):
```bash
curl -X PUT http://localhost:3000/api/v1/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "departmentId": "uuid-here",
    "name": "Engineering"
  }'
# Expected: 400 - Employee emails required
```

### Delete Department
```
DELETE /api/v1/departments?id=DEPARTMENT_ID
```

```bash
curl -X DELETE "http://localhost:3000/api/v1/departments?id=uuid-here" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

## 3. Employees API

### Add Employee
```
POST /api/v1/employees
```

#### ✅ Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "employee": {
      "name": "Alice Smith",
      "email": "alice@example.com",
      "department": "dept-uuid-here",
      "role": "Developer",
      "joinDate": "2025-01-15"
    }
  }'
```

#### ❌ Invalid Requests

**Invalid Email Format** (should fail now):
```bash
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "employee": {
      "name": "Bob",
      "email": "invalid-email",
      "department": "dept-uuid"
    }
  }'
# Expected: 400 - Invalid email format
```

**Duplicate Employee**:
```bash
# Create first
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"employee": {"name": "Alice", "email": "alice@example.com", "department": "uuid"}}'

# Try create same
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"employee": {"name": "Alice", "email": "alice@example.com", "department": "uuid"}}'
# Expected: 409 - Employee with this email already exists
```

### Get Employees
```
GET /api/v1/employees
```

```bash
curl -X GET http://localhost:3000/api/v1/employees \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Update Employee
```
PUT /api/v1/employees
```

#### ✅ Valid Request
```bash
curl -X PUT http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "employee": {
      "_id": "employee-uuid",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "department": "dept-uuid",
      "role": "Senior Developer"
    }
  }'
```

#### ❌ Invalid Requests

**Missing _id** (should fail):
```bash
curl -X PUT http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"employee": {"name": "Alice", "email": "alice@example.com"}}'
# Expected: 400 - Employee email and ID required
```

### Delete Employee
```
DELETE /api/v1/employees?employeeEmail=EMAIL
```

```bash
curl -X DELETE "http://localhost:3000/api/v1/employees?employeeEmail=alice@example.com" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

## 4. Tasks API

### Create Task
```
POST /api/v1/tasks
```

#### ✅ Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Implement login feature",
    "description": "Add authentication to the app",
    "priority": "High",
    "dueDate": "2025-12-31T23:59:59Z",
    "assigned": [
      {"name": "Alice", "email": "alice@example.com"},
      {"name": "Bob", "email": "bob@example.com"}
    ]
  }'
```

#### ❌ Invalid Requests

**Empty Title** (should fail now):
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "   ",
    "description": "Test",
    "priority": "High",
    "dueDate": "2025-12-31T23:59:59Z",
    "assigned": []
  }'
# Expected: 400 - Task title required
```

**Invalid Date** (should fail now):
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Test",
    "priority": "High",
    "dueDate": "invalid-date",
    "assigned": []
  }'
# Expected: 400 - Invalid due date
```

**Missing assigned** (should now handle gracefully):
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Test",
    "priority": "High",
    "dueDate": "2025-12-31T23:59:59Z"
  }'
# Expected: 201 - Created (assigned defaults to empty array)
```

### Get Tasks
```
GET /api/v1/tasks
GET /api/v1/tasks?id=TASK_ID
```

```bash
# Get all tasks
curl -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Get specific task
curl -X GET "http://localhost:3000/api/v1/tasks?id=task-uuid" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Update Task
```
PUT /api/v1/tasks
```

#### ✅ Valid Request
```bash
curl -X PUT http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "taskId": "task-uuid",
    "title": "Implement login (Updated)",
    "priority": "Critical",
    "dueDate": "2025-12-15T23:59:59Z"
  }'
```

### Delete Task
```
DELETE /api/v1/tasks?id=TASK_ID
```

```bash
curl -X DELETE "http://localhost:3000/api/v1/tasks?id=task-uuid" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

## 5. Task Update API

### Update Task Completion
```
PUT /api/v1/tasks/update
```

#### ✅ Valid Request
```bash
curl -X PUT http://localhost:3000/api/v1/tasks/update \
  -H "Content-Type: application/json" \
  -d '{
    "admin": "admin@example.com",
    "task_id": "task-uuid",
    "completed": true
  }'
```

#### ❌ Invalid Requests

**Missing Parameters**:
```bash
curl -X PUT http://localhost:3000/api/v1/tasks/update \
  -H "Content-Type: application/json" \
  -d '{"admin": "admin@example.com"}'
# Expected: 400 - admin, task_id, and completed required
```

---

## 6. Send-Mail API

### Send Email
```
POST /api/v1/send-mail
```

#### ✅ Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/send-mail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "message": "This is a test message"
  }'
```

#### ❌ Invalid Requests

**Invalid Email** (should fail now):
```bash
curl -X POST http://localhost:3000/api/v1/send-mail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "message": "Test message"
  }'
# Expected: 400 - Invalid email format
```

**Missing Message**:
```bash
curl -X POST http://localhost:3000/api/v1/send-mail \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
# Expected: 400 - Email and message are required
```

---

## 7. Task Notify API

### Send Task Notification
```
GET /api/v1/tasks/notify?admin=ADMIN_EMAIL&email=USER_EMAIL&task_id=TASK_ID
```

#### ✅ Valid Request
```bash
curl -X GET "http://localhost:3000/api/v1/tasks/notify?admin=admin@example.com&email=user@example.com&task_id=task-uuid"
```

#### ❌ Invalid Requests

**Invalid Email** (should fail now):
```bash
curl -X GET "http://localhost:3000/api/v1/tasks/notify?admin=admin@example.com&email=invalid-email&task_id=task-uuid"
# Expected: 400 - Invalid email format
```

**Missing Parameters**:
```bash
curl -X GET "http://localhost:3000/api/v1/tasks/notify?admin=admin@example.com"
# Expected: 400 - admin, email, and task_id are required
```

---

## Testing Checklist

### Before Deployment
- [ ] Test all 7 API endpoints
- [ ] Test validation on each endpoint
- [ ] Verify MongoDB connectivity
- [ ] Check email sending configuration
- [ ] Verify Clerk authentication tokens

### Data Integrity
- [ ] Verify department-employee relationships
- [ ] Check task assignment to employees
- [ ] Verify data consistency across operations

### Security
- [ ] Test authentication on protected endpoints
- [ ] Verify email validation on all endpoints
- [ ] Check for SQL/NoSQL injection vulnerabilities
- [ ] Test authorization (users can only access own data)

### Performance
- [ ] Load test with 100+ tasks
- [ ] Load test with 100+ employees
- [ ] Check MongoDB indexes
- [ ] Monitor response times

---

## Environment Variables Required

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
BUSINESS_SMTP=business@example.com

MONGODB_URI=mongodb://...
```

---

## Notes

- All authenticated endpoints require valid Clerk JWT token
- All dates should be in ISO 8601 format
- Email validation is now enforced across all APIs
- Empty strings (whitespace only) are rejected for text fields
- All array operations are now safe (null/undefined handling)


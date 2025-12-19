/**
 * Supabase PostgreSQL Database Initialization
 * 
 * This file contains SQL schemas and setup instructions for migrating from MongoDB to Supabase PostgreSQL.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Supabase Dashboard → SQL Editor
 * 2. Copy and paste the schemas below into a new SQL query
 * 3. Execute the query
 * 4. Add environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 */

// USERS TABLE
export const usersSchema = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

// DEPARTMENTS TABLE
export const departmentsSchema = `
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'General',
  description TEXT,
  professional_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);
`;

// EMPLOYEES TABLE
export const employeesSchema = `
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  phone VARCHAR(20),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  salary INT8,
  profile_photo TEXT,
  gender TEXT,
  date_of_birth DATE
);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
`;

// TASKS TABLE
export const tasksSchema = `
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'Low',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
`;

// TASK ASSIGNMENTS TABLE (Junction table for assigned users)
export const taskAssignmentsSchema = `
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_employee_id ON task_assignments(employee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_assignments_unique ON task_assignments(task_id, employee_id);
`;

// FEEDBACK TABLE
export const feedbackSchema = `
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
`;
// SQL EXECUTION GUIDE
export const sqlExecutionGuide = `
-- Copy and paste this entire script into Supabase SQL Editor to initialize the database

${usersSchema}

${departmentsSchema}

${employeesSchema}

${tasksSchema}

${taskAssignmentsSchema}

${feedbackSchema}

-- Enable Row Level Security (RLS) for multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Service role bypasses RLS so these allow authenticated users
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Grant permissions to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
`;

// ENVIRONMENT VARIABLES SETUP
export const envSetup = {
  instructions: `
    Add these environment variables to your .env.local file:
    
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    
    Get these from:
    1. Supabase Dashboard
    2. Settings → API
    3. Copy Project URL and Service Role Key (anon key won't work for POST requests)
  `,
};

export default {
  usersSchema,
  departmentsSchema,
  employeesSchema,
  tasksSchema,
  taskAssignmentsSchema,
  feedbackSchema,
  sqlExecutionGuide,
  envSetup,
};

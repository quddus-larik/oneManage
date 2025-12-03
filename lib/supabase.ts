import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables");
}

// Create a single instance of Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// Helper function to create user
export async function createUser(name: string, email: string, avatar: string | null) {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        email,
        avatar,
        role: "admin",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase error creating user:", error);
    throw error;
  }
  return data;
}

// Helper function to get user with relations
export async function getUserWithRelations(email: string) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError && userError.code !== "PGRST116") throw userError;
  if (!user) return null;

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .eq("user_id", user.id);

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user.id);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id);

  return {
    ...user,
    departments,
    employees,
    tasks,
  };
}

export async function updateUser(email: string, updates: any) {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("email", email)
    .select()
    .single();

  if (error) throw error;
  return data;
}

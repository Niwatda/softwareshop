import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-side client ใช้ service role key (มีสิทธิ์เต็ม เช่น upload/delete ไฟล์)
// ใช้ lazy initialization เพื่อไม่ให้ error ตอน build
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
  return _supabaseAdmin;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  IMAGES: "images",
  SLIPS: "slips",
  PROGRAMS: "programs",
} as const;

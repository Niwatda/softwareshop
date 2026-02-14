import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client ใช้ service role key (มีสิทธิ์เต็ม เช่น upload/delete ไฟล์)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  IMAGES: "images",
  SLIPS: "slips",
  PROGRAMS: "programs",
} as const;

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ircbxqlnbfomotjhcjfk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY2J4cWxuYmZvbW90amhjamZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwNTU4NSwiZXhwIjoyMDc0MzgxNTg1fQ.G7H8-hbwxl6BXsuCfNE87YZysbGAN4t3UNaF1x-GRKE";

export const supabase = createClient(supabaseUrl, supabaseKey);

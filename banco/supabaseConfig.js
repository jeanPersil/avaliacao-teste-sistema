import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ircbxqlnbfomotjhcjfk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY2J4cWxuYmZvbW90amhjamZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDU1ODUsImV4cCI6MjA3NDM4MTU4NX0.fPYmyXlSKE7sqJjwYCQb6L1sdyk3PhzthJ4c4nZ2J0U'

export const supabase = createClient(supabaseUrl, supabaseKey)
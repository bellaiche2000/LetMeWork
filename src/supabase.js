import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsydreyupczdhjhneejy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeWRyZXl1cGN6ZGhqaG5lZWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY1NDgsImV4cCI6MjA5MTIzMjU0OH0.1wHtRLdrm8GuXv9DjP_bgPjRAscKM3kixF7p2Ow-dUE'

export const supabase = createClient(supabaseUrl, supabaseKey)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqjofpdwtmfokcgeubpc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxam9mcGR3dG1mb2tjZ2V1YnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Mjc5NzIsImV4cCI6MjA5MTMwMzk3Mn0.rx_mkugDLQC9RqaLfym4HjoPlT80zmZuByuknqQDS7E'

export const supabase = createClient(supabaseUrl, supabaseKey)
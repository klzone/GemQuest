import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vadxnpcyxkwbivsrmgqv.supabase.co'
// Public anon key from user memories
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZHhucGN5eGt3Yml2c3JtZ3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzIyMDEsImV4cCI6MjA3MjIwODIwMX0.fxh-UIgRfA3efTcarWmOeUv1qV_5x2Y4rFUHzeas0Ts'

export const supabase = createClient(supabaseUrl, supabaseKey)

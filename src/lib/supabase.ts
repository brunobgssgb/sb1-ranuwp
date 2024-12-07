import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzeqcvxxphgauffftvcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZXFjdnh4cGhnYXVmZmZ0dmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTkyNDMsImV4cCI6MjA0ODkzNTI0M30.vNzgnEignpLRd0CqHFPp74SuG15zJ8WBLJB059CNgxg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvqxvcedoawzicutzygv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cXh2Y2Vkb2F3emljdXR6eWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjYwNzAsImV4cCI6MjA3NDgwMjA3MH0.LNKcQIvEDIOg02g0CsVSDqohliYJCNW2lxg-a7nT8To';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
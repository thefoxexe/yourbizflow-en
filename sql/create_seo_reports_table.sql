-- Create seo_reports table for storing SEO analysis history
CREATE TABLE IF NOT EXISTS public.seo_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    scores JSONB NOT NULL,
    results JSONB NOT NULL,
    report_lang TEXT DEFAULT 'fr',
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_seo_reports_user_id ON public.seo_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_analyzed_at ON public.seo_reports(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_reports_url ON public.seo_reports(url);

-- Enable Row Level Security
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SEO reports" ON public.seo_reports;
DROP POLICY IF EXISTS "Users can insert their own SEO reports" ON public.seo_reports;
DROP POLICY IF EXISTS "Users can delete their own SEO reports" ON public.seo_reports;

-- RLS Policy: Users can view their own SEO reports
CREATE POLICY "Users can view their own SEO reports"
    ON public.seo_reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own SEO reports
CREATE POLICY "Users can insert their own SEO reports"
    ON public.seo_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own SEO reports
CREATE POLICY "Users can delete their own SEO reports"
    ON public.seo_reports
    FOR DELETE
    USING (auth.uid() = user_id);

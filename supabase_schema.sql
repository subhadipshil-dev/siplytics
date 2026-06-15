-- ====================================================================
-- SIPlytics Database Schema & Row Level Security (RLS) Policies
-- ====================================================================

-- ── 1. PROFILES TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_data JSONB DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- ── 2. USER PREFERENCES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark',
    risk_profile TEXT NOT NULL DEFAULT 'moderate',
    dashboard_layout JSONB DEFAULT NULL,
    preferred_currency TEXT NOT NULL DEFAULT 'INR',
    saved_assumptions JSONB DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);


-- ── 3. GOALS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY, -- Text ID to match client-side generated goal IDs
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_savings NUMERIC NOT NULL,
    years_remaining NUMERIC NOT NULL,
    expected_return NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);


-- ── 4. SCENARIOS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scenarios (
    id TEXT PRIMARY KEY, -- Text ID to match client-side scenario IDs
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    inputs JSONB NOT NULL,
    outputs JSONB NOT NULL,
    portfolio JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own scenarios" ON public.scenarios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios" ON public.scenarios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios" ON public.scenarios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios" ON public.scenarios
    FOR DELETE USING (auth.uid() = user_id);


-- ── 5. NEW USER TRIGGERS & FUNCTIONS ────────────────────────────────
-- Create a helper function to initialize profiles and preferences automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, onboarding_completed)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', ''), 
        FALSE
    );

    INSERT INTO public.user_preferences (user_id, theme, risk_profile, preferred_currency)
    VALUES (
        new.id,
        'dark',
        'moderate',
        'INR'
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

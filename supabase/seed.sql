-- Create encrypted Resy credentials table
CREATE TABLE resy_credentials (
    id uuid DEFAULT uuid_generate_v4() primary key,
    user_id uuid references auth.users NOT NULL,
    email text NOT NULL,
    encrypted_password text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE resy_credentials enable ROW LEVEL security;

-- Create policy to only allow users to see their own credentials
CREATE policy "Users can only access their own Resy credentials" ON resy_credentials FOR ALL USING (auth.uid() = user_id);

-- Create restaurants table
CREATE TABLE restaurants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    NAME text NOT NULL,
    resy_venue_id text NOT NULL,
    thumbnail_url text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reservation requests table
CREATE TABLE reservation_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    restaurant_id uuid REFERENCES restaurants NOT NULL,
    party_size INTEGER NOT NULL,
    desired_times text [ ] NOT NULL,
    -- Array of times in format HH:MM
    desired_date DATE NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'successful', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    booking_reference text -- Resy booking reference if successful
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

ALTER TABLE reservation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all restaurants" ON restaurants FOR
SELECT USING (TRUE);

CREATE POLICY "Users can only view their own reservation requests" ON reservation_requests FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_reservation_requests_user_id ON reservation_requests(user_id);

CREATE INDEX idx_reservation_requests_status ON reservation_requests(status);

-- Create payment methods table
CREATE TABLE payment_methods (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    TYPE TEXT NOT NULL CHECK (TYPE IN ('apple_pay', 'stripe', 'coinbase')),
    provider_payment_id TEXT NOT NULL,
    last_four TEXT,
    card_type TEXT,
    wallet_address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider_payment_id)
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to see their own payment methods
CREATE POLICY "Users can only access their own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

-- SEED SAMPLE DATA
-- Insert sample restaurants
INSERT INTO restaurants (id, NAME, resy_venue_id, thumbnail_url)
VALUES (
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Le Bernardin',
        '123',
        'https://resizer.otstatic.com/v2/photos/xlarge/1/23681914.jpg'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Eleven Madison Park',
        '456',
        'https://media.cntraveler.com/photos/5859a1d9e1e6f0127c137532/16:9/w_2580,c_limit/eleven-madison-park-cr-courtesy.jpg'
    ),
    (
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'Atomix',
        '789',
        'https://static01.nyt.com/images/2018/07/25/dining/25REST-ATOMIX1/merlin_141083557_de2f4c67-e295-4cf9-92b4-4991eba7cc20-superJumbo.jpg'
    );

-- First, add the new columns to the resy_credentials table
ALTER TABLE resy_credentials
ADD COLUMN token TEXT,
    ADD COLUMN refresh_token TEXT,
    ADD COLUMN legacy_token TEXT,
    ADD COLUMN profile_image_url TEXT;

-- Update existing records to have NULL values for new columns
UPDATE resy_credentials
SET token = NULL,
    refresh_token = NULL,
    legacy_token = NULL,
    profile_image_url = NULL
WHERE token IS NULL;

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

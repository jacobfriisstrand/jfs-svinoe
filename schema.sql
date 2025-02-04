-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bookings table for calendar
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  family_member TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Calendar settings table
CREATE TABLE calendar_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_link TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tasks table for to-do list
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT status_check CHECK (status IN ('not_started', 'doing', 'done'))
);

-- Pages table for Check-in and Leaving pages
CREATE TABLE pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- A-Z Guide entries
CREATE TABLE guide_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default pages
INSERT INTO pages (slug, content) VALUES
('check-in', 'Welcome to our summer house!'),
('leaving', 'Thank you for staying at our summer house!');

-- Insert default calendar settings
INSERT INTO calendar_settings (external_link) VALUES ('');
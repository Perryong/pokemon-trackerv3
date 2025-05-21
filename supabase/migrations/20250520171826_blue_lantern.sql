/*
  # Pokémon TCG Cards Schema

  1. New Tables
    - `cards`
      - Core card information
      - Stores card details, rarity, types
      - Includes market data references
    
    - `user_cards`
      - Links users to their cards
      - Tracks quantity, condition, acquisition details
      - Stores personal notes and ratings
    
  2. Security
    - RLS enabled on all tables
    - Policies for proper data access control
    - Protected user data

  3. Features
    - Card condition tracking
    - Acquisition history
    - Collection management
*/

-- Create cards table for storing card information
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  rarity text NOT NULL,
  release_date date NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX cards_name_idx ON cards(name);
CREATE INDEX cards_type_idx ON cards(type);
CREATE INDEX cards_rarity_idx ON cards(rarity);
CREATE INDEX cards_release_date_idx ON cards(release_date);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cards"
  ON cards
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_cards table for tracking user collections
CREATE TABLE IF NOT EXISTS user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  acquisition_date date DEFAULT CURRENT_DATE,
  condition_rating integer NOT NULL,
  notes text,
  quantity integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_cards_condition_rating_check CHECK (condition_rating >= 1 AND condition_rating <= 10),
  CONSTRAINT user_cards_quantity_check CHECK (quantity > 0),
  UNIQUE(user_id, card_id)
);

CREATE INDEX user_cards_user_id_idx ON user_cards(user_id);
CREATE INDEX user_cards_card_id_idx ON user_cards(card_id);
CREATE INDEX user_cards_acquisition_date_idx ON user_cards(acquisition_date);

ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collection"
  ON user_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own collection"
  ON user_cards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON user_cards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
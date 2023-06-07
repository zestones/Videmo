-- Create the Category table
CREATE TABLE IF NOT EXISTS Category (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- Create the Extension table
CREATE TABLE IF NOT EXISTS Extension (
  id INTEGER PRIMARY KEY,
  link TEXT,
  name TEXT,
  local INTEGER
);

-- Create the Serie table
CREATE TABLE IF NOT EXISTS Serie (
  id INTEGER PRIMARY KEY,
  name TEXT,
  nb_episodes INTEGER,
  nb_season INTEGER,
  description TEXT,
  category_id INTEGER,
  extension_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES Category (id),
  FOREIGN KEY (extension_id) REFERENCES Extension (id)
);

-- Insert the default category
INSERT INTO Category (name) VALUES ('Default');
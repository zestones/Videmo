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
  link TEXT,
  image TEXT,
  extension_id INTEGER,
  serie_category_id INTEGER,
  FOREIGN KEY (extension_id) REFERENCES Extension (id),
  FOREIGN KEY (serie_category_id) REFERENCES SerieCategory (id)
  UNIQUE (name)
);

-- Create SerieCategory table
CREATE TABLE IF NOT EXISTS SerieCategory (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  category_id INTEGER,
  FOREIGN KEY (serie_id) REFERENCES Serie (id),
  FOREIGN KEY (category_id) REFERENCES Category (id),
  UNIQUE (serie_id, category_id)
);

-- Insert the default category
INSERT INTO Category (name) VALUES ('Default');
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
  basename TEXT, -- The name of the serie
  name TEXT, -- Sub name of the serie (ex: Seasons for local series)
  description TEXT,
  link TEXT,
  image TEXT,
  extension_id INTEGER,
  FOREIGN KEY (extension_id) REFERENCES Extension (id),
  UNIQUE (basename, name, link)
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

-- Create Track table
CREATE TABLE IF NOT EXISTS Track (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  episode_id INTEGER,
  FOREIGN KEY (serie_id) REFERENCES Serie (id),
  FOREIGN KEY (episode_id) REFERENCES Episode (id)
);

-- Create Episode table
CREATE TABLE IF NOT EXISTS Episode (
  id INTEGER PRIMARY KEY,
  name TEXT,
  viewed INTEGER,
  bookmarked INTEGER
);
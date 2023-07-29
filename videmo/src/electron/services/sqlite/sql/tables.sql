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
  inLibrary INTEGER,
  extension_id INTEGER,
  FOREIGN KEY (extension_id) REFERENCES Extension (id),
  UNIQUE (basename, name, link)
);

-- Create the SerieGenre table
CREATE TABLE IF NOT EXISTS SerieGenre (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  genre_id INTEGER,
  FOREIGN KEY (serie_id) REFERENCES Serie (id),
  FOREIGN KEY (genre_id) REFERENCES Genre (id),
  UNIQUE (serie_id, genre_id)
);

-- Create the Genre table
CREATE TABLE IF NOT EXISTS Genre (
  id INTEGER PRIMARY KEY,
  name TEXT
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

-- Create the Category table
CREATE TABLE IF NOT EXISTS Category (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- Create the LastOpenedCategory table
CREATE TABLE IF NOT EXISTS LastOpenedCategory (
  id INTEGER PRIMARY KEY,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES Category (id)
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
  link TEXT,
  viewed INTEGER,
  bookmarked INTEGER,
  played_time DATETIME
);

-- Create the History table
CREATE TABLE IF NOT EXISTS History (
  id INTEGER PRIMARY KEY,
  episode_id INTEGER,
  timestamp DATETIME,
  FOREIGN KEY (episode_id) REFERENCES Episode (id)
);

-- Insert the default category
INSERT INTO Category (name) VALUES ('Default');

-- Insert the default last opened category
INSERT INTO LastOpenedCategory (category_id) VALUES (1);
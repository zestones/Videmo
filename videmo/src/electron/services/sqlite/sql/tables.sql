-- Create the Extension table
CREATE TABLE IF NOT EXISTS Extension (
  id INTEGER PRIMARY KEY,
  link TEXT,
  name TEXT,
  local INTEGER,
  is_active INTEGER,
  UNIQUE (link)
);

-- Create the Serie table
CREATE TABLE IF NOT EXISTS Serie (
  id INTEGER PRIMARY KEY,
  basename TEXT,
  name TEXT, 
  link TEXT,
  image TEXT,
  inLibrary INTEGER,
  extension_id INTEGER,
  parent_id INTEGER,
  FOREIGN KEY (extension_id) REFERENCES Extension (id),
  UNIQUE (link)
);

-- Create the SerieInfos table
CREATE TABLE IF NOT EXISTS SerieInfos (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  description TEXT,
  duration DATETIME,
  number_of_episodes INTEGER,
  total_viewed_episodes INTEGER,
  rating INTEGER,
  releaseDate DATETIME,
  FOREIGN KEY (serie_id) REFERENCES Serie (id)
);

-- Create the SerieGenre table
CREATE TABLE IF NOT EXISTS SerieGenre (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  genre_id INTEGER,
  FOREIGN KEY (serie_id) REFERENCES SerieInfos (serie_id),
  FOREIGN KEY (genre_id) REFERENCES Genre (id),
  UNIQUE (serie_id, genre_id)
);

-- Create the Genre table
CREATE TABLE IF NOT EXISTS Genre (
  id INTEGER PRIMARY KEY,
  name TEXT,
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

-- Create the Category table
CREATE TABLE IF NOT EXISTS Category (
  id INTEGER PRIMARY KEY,
  name TEXT,
  UNIQUE (name)
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
  FOREIGN KEY (episode_id) REFERENCES Episode (id),
  UNIQUE (serie_id, episode_id)
);

-- Create Episode table
CREATE TABLE IF NOT EXISTS Episode (
  id INTEGER PRIMARY KEY,
  name TEXT,
  link TEXT,
  viewed INTEGER,
  bookmarked INTEGER,
  played_time DATETIME,
  hash DATETIME,
  UNIQUE (link)
);

-- Create the History table
CREATE TABLE IF NOT EXISTS History (
  id INTEGER PRIMARY KEY,
  episode_id INTEGER,
  timestamp DATETIME,
  FOREIGN KEY (episode_id) REFERENCES Episode (id),
  UNIQUE (episode_id, timestamp)
);

-- Create the UpdatedSerie table
CREATE TABLE IF NOT EXISTS UpdatedSerie (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  FOREIGN KEY (serie_id) REFERENCES Serie (id)
);

-- Insert the default category
INSERT INTO Category (name) VALUES ('Default');

-- Insert the default last opened category
INSERT INTO LastOpenedCategory (category_id) VALUES (1);
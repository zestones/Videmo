-- Step 1: Create a new table without the UNIQUE constraint on 'link'
CREATE TABLE IF NOT EXISTS Episode_new (
  id INTEGER PRIMARY KEY,
  name TEXT,
  link TEXT,
  viewed INTEGER,
  bookmarked INTEGER,
  played_time DATETIME,
  hash DATETIME,
  serverName TEXT
);

-- Step 2: Copy data from the original table to the new one
INSERT INTO Episode_new (id, name, link, viewed, bookmarked, played_time, hash, serverName)
SELECT id, name, link, viewed, bookmarked, played_time, hash, serverName
FROM Episode;

-- Step 3: Drop the original table
DROP TABLE Episode;

-- Step 4: Rename the new table to the original table name
ALTER TABLE Episode_new RENAME TO Episode;

INSERT INTO app_version_tracker (version, execution_date, executed) VALUES (3, datetime('now'), 1);
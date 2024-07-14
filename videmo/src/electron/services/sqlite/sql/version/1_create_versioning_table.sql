-- Create the app_version_tracker table
CREATE TABLE IF NOT EXISTS app_version_tracker (
  id INTEGER PRIMARY KEY,
  version INTEGER,
  execution_date DATETIME,
  executed INTEGER,
  UNIQUE (version)
);

-- Insert the first version
INSERT INTO app_version_tracker (version, execution_date, executed) VALUES (1, datetime('now'), 1);
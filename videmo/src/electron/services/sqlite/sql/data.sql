-- Insert other categories
INSERT INTO Category (name) VALUES ('PLAN TO WATCH');
INSERT INTO Category (name) VALUES ('COMPLETED');
INSERT INTO Category (name) VALUES ('ON HOLD');
INSERT INTO Category (name) VALUES ('DROPPED');
INSERT INTO Category (name) VALUES ('WATCHING');
INSERT INTO Category (name) VALUES ('MAINSTREAM');
INSERT INTO Category (name) VALUES ('MASTERCLASS');
INSERT INTO Category (name) VALUES ('TOP');
INSERT INTO Category (name) VALUES ('GOOD');
INSERT INTO Category (name) VALUES ('AVERAGE');
INSERT INTO Category (name) VALUES ('BAD');
INSERT INTO Category (name) VALUES ('TRASH');

-- Insert Filters
INSERT INTO Filter (name) VALUES ('downloaded');
INSERT INTO Filter (name) VALUES ('started');
INSERT INTO Filter (name) VALUES ('finished');

-- Insert Sorts 
-- ! ATTENTION ! The names should be the same as the ones in the Sort enum in the frontend
INSERT INTO Sort (name) VALUES ('alphabetical');
INSERT INTO Sort (name) VALUES ('release date');
INSERT INTO Sort (name) VALUES ('rating');
INSERT INTO Sort (name) VALUES ('number of episodes');

-- Insert CategoryFilter for each category (with a flag asc and alphabetically sorted)
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (1, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (2, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (3, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (4, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (5, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (6, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (7, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (8, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (9, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (10, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (11, 1, 'asc');
INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (12, 1, 'asc');
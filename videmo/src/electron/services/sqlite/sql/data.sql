-- Insert other categories
INSERT INTO Category (name, order_id) VALUES ('PLAN TO WATCH', 1);
INSERT INTO Category (name, order_id) VALUES ('COMPLETED', 2);
INSERT INTO Category (name, order_id) VALUES ('ON HOLD', 3);
INSERT INTO Category (name, order_id) VALUES ('DROPPED', 4);
INSERT INTO Category (name, order_id) VALUES ('WATCHING', 5);
INSERT INTO Category (name, order_id) VALUES ('MAINSTREAM', 6);
INSERT INTO Category (name, order_id) VALUES ('MASTERCLASS', 7);
INSERT INTO Category (name, order_id) VALUES ('TOP', 8);
INSERT INTO Category (name, order_id) VALUES ('GOOD', 9);
INSERT INTO Category (name, order_id) VALUES ('AVERAGE', 10);
INSERT INTO Category (name, order_id) VALUES ('BAD', 11);
INSERT INTO Category (name, order_id) VALUES ('TRASH', 12);

-- Insert Filters
INSERT INTO Filter (name) VALUES ('downloaded');
INSERT INTO Filter (name) VALUES ('watched');
INSERT INTO Filter (name) VALUES ('not watched');
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


-- Insert the Themes
INSERT INTO Theme (name, is_active) VALUES ('default-theme', 1); -- The default theme is active
INSERT INTO Theme (name, is_active) VALUES ('dark-theme', 0);
INSERT INTO Theme (name, is_active) VALUES ('light-theme', 0);
INSERT INTO Theme (name, is_active) VALUES ('ocean-theme', 0);
INSERT INTO Theme (name, is_active) VALUES ('fire-theme', 0);
INSERT INTO Theme (name, is_active) VALUES ('forest-theme', 0);
INSERT INTO Theme (name, is_active) VALUES ('sky-theme', 0);

-- Insert the DisplayMode (with the default display option)
INSERT INTO DisplayMode (name) VALUES ('compact');
INSERT INTO DisplayMode (name) VALUES ('spaced');
INSERT INTO DisplayMode (name) VALUES ('list');
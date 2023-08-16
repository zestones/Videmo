-- Delete the content of the History table
DELETE FROM History;

-- Delete the content of the Track table
DELETE FROM Track;

-- Delete the content of the SerieGenre table
DELETE FROM SerieGenre;

-- Delete the content of the SerieCategory table
DELETE FROM SerieCategory;

-- Delete the content of the Episode table
DELETE FROM Episode;

-- Delete the content of the Serie table
DELETE FROM Serie;

-- Delete the content of the Extension table
DELETE FROM Extension;

-- Delete the content of the LastOpenedCategory table
DELETE FROM LastOpenedCategory WHERE id <> 1;

-- Delete the content of the Genre table
DELETE FROM Genre;

-- Delete the content of the Category table
DELETE FROM Category WHERE id <> 1;
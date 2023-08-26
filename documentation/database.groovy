
Table "Extension" {
  "id" INTEGER [pk]
  "link" TEXT
  "name" TEXT
  "local" INTEGER
}

// Become a table to store only the root series (series -> episodes)
Table "Serie" {
  "id" INTEGER [pk]
  "basename" TEXT
  "name" TEXT
  "link" TEXT
  "image" TEXT
  "extension_id" INTEGER
  "inLibrary" INTEGER
  "parent_id" INTEGER
Indexes {
  (link) [unique]
}
}

Table "SerieGenre" {
  "id" INTEGER [pk]
  "serie_id" INTEGER
  "genre_id" INTEGER
Indexes {
  (serie_id, genre_id) [unique]
}
}

Table "Genre" {
  "id" INTEGER [pk]
  "name" TEXT
}

Table "SerieCategory" {
  "id" INTEGER [pk]
  "serie_id" INTEGER
  "category_id" INTEGER

Indexes {
  (serie_id, category_id) [unique]
}
}

Table "Category" {
  "id" INTEGER [pk]
  "name" TEXT
}

Table "Track" {
  "id" INTEGER [pk]
  "serie_id" INTEGER
  "episode_id" INTEGER
}

Table "Episode" {
  "id" INTEGER [pk]
  "link" TEXT
  "name" TEXT
  "viewed" INTEGER
  "bookmarked" INTEGER
  "played_time" DATETIME
}

Table "LastOpenedCategory" {
  "id" INTEGER [pk]
  "category_id" INTEGER
}

Table "History" {
  "id" INTEGER [pk]
  "episode_id" INTEGER
  "timestamp" DATETIME
}

// Update should work only for the series that has inLibrary to true
// Should search at max n+1 
Table "UpdatedSeries" {
  "id" INTEGER [pk]
  "serie_id" INTEGER
}
  
Ref:"Serie"."id" < "UpdatedSeries"."serie_id"

Ref:"Extension"."id" < "Serie"."extension_id"

Ref:"Serie"."id" < "SerieCategory"."serie_id"

Ref:"Category"."id" < "SerieCategory"."category_id"

Ref:"Category"."id" < "LastOpenedCategory"."category_id"

Ref:"Serie"."id" < "SerieGenre"."serie_id"

Ref:"Genre"."id" < "SerieGenre"."genre_id"

Ref:"Serie"."id" < "Track"."serie_id"

Ref:"Episode"."id" < "Track"."episode_id"

Ref:"Episode"."id" < "History"."episode_id"
--Call columns inside the same thing as the constructor functions for the location
-- don't include this.

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(20, 14),
  longitude NUMERIC(20, 14)
)

--Don't use comma in the last entry
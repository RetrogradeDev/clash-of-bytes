-- Transfer name → username and displayUsername

UPDATE "users"
SET 
  "username" = LOWER(REPLACE("name", ' ', '')), -- converts e.g. 'John Doe' → 'johndoe'
  "displayUsername" = "name"
WHERE 
  "username" IS NULL AND "name" IS NOT NULL;

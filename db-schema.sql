--sqlite3 db/data.sqlite3 < db-schema.sql

CREATE TABLE prompts (
	prompt_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL
);
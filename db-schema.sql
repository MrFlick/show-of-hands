--sqlite3 db/data.sqlite3 < db-schema.sql
--sqlite3 db/data.sqlite3 < db-sample.sql

CREATE TABLE prompts (
	prompt_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	type TEXT NOT NULL,
	options TEXT
);

CREATE TABLE polls (
	poll_id INTEGER PRIMARY KEY,
	prompt_id INTEGER,
	title TEXT NOT NULL,
	type TEXT NOT NULL,
	options TEXT,
	is_open INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE poll_responses (
	poll_id INTEGER NOT NULL,
	client_id INTEGER,
	response TEXT,
	PRIMARY KEY (poll_id, client_id)
);

CREATE TABLE snippets (
	snippet_id INTEGER PRIMARY KEY,
	title TEXT,
	code TEXT
);

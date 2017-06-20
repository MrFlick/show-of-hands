--sqlite3 db/data.sqlite3 < db-schema.sql
--sqlite3 db/data.sqlite3 < db-sample.sql

CREATE TABLE polls (
	poll_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	type TEXT NOT NULL,
	options TEXT,
	status INTEGER NOT NULL DEFAULT 0,
	open_seq INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE poll_responses (
	poll_id INTEGER NOT NULL,
	client_id TEXT,
	response TEXT,
	PRIMARY KEY (poll_id, client_id)
);

CREATE TABLE snippets (
	snippet_id INTEGER PRIMARY KEY,
	title TEXT,
	code TEXT,
	status INTEGER NOT NULL DEFAULT 0,
	open_seq INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE images (
	img_id INTEGER PRIMARY KEY,
	blob BLOB
);

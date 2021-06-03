CREATE TABLE polls (
	poll_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	type TEXT NOT NULL,
	options TEXT,
	status INTEGER NOT NULL DEFAULT 0,
	shared INTEGER NOT NULL DEFAULT 0,
	open_seq INTEGER NOT NULL DEFAULT 0,
	tag TEXT
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
	open_seq INTEGER NOT NULL DEFAULT 0,
	tag TEXT
);

CREATE TABLE images (
	img_id INTEGER PRIMARY KEY,
	mime_type TEXT,
	width INTEGER,
	height INTEGER,
	blob BLOB
);

CREATE TABLE slides (
	slide_id INTEGER PRIMARY KEY,
	image_name TEXT,
	thumbnail_name TEXT,
	status INTEGER NOT NULL DEFAULT 0,
	seq INTEGER NOT NULL DEFAULT 0
);
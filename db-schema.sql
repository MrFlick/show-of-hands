--sqlite3 db/data.sqlite3 < db-schema.sql

CREATE TABLE prompts (
	prompt_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL
);

CREATE TABLE prompt_questions (
	question_id INTEGER PRIMARY KEY,
	prompt_id INTEGER NOT NULL,
	question TEXT NOT NULL,
	options TEXT
);

CREATE TABLE polls (
	poll_id INTEGER PRIMARY KEY,
	prompt_id INTEGER,
	title TEXT NOT NULL
);

CREATE TABLE poll_questions (
	question_id INTEGER PRIMARY KEY,
	poll_id INTEGER NOT NULL,
	question TEXT NOT NULL,
	options TEXT
);

CREATE TABLE poll_responses (
	question_id INTEGER NOT NULL,
	user_id INTEGER,
	response TEXT
);

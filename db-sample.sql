INSERT INTO prompts(prompt_id, title)
values(1, "Favorties");

INSERT INTO prompt_questions(question_id, prompt_id, question, options)
values(1, 1, "Letter", "{values: ['A','B','C']}");

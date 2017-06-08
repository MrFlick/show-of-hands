INSERT INTO polls(poll_id, title, type, options)
values(1, "How much have you used R before BDSI", "multiple_choice", 
    '{"values": ["Never","Very Little","Some","Very Often"]}');

INSERT INTO polls(poll_id, title, type, options)
values(2, "How much programming have you done before BDSI", "multiple_choice", 
    '{"values": ["None","Very Little","Some","A Lot"]}');

INSERT INTO polls(poll_id, title, type)
values(3, "What would you most like to learn about R", "text");

INSERT INTO polls(poll_id, title, type, options)
values(4, "Do you think undergrads are more likely to date someone in same grade", "multiple_choice", 
    '{"values": ["Yes","No"]}');

INSERT INTO polls(poll_id, title, type)
values(5, "On a scale from 1-10, how would most people rate their attractiveness", "number");

INSERT INTO polls(poll_id, title, type)
values(6, "Suggestion for upcoming sessions", "text");


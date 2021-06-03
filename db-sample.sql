INSERT INTO polls(title, type, options)
values("How much have you used R before BDSI", "multiple_choice", 
    '{"values": ["Never","Very Little","Some","Very Often"]}');

INSERT INTO polls(title, type, options)
values("How much programming have you done before BDSI", "multiple_choice", 
    '{"values": ["None","Very Little","Some","A Lot"]}');

INSERT INTO polls(title, type, tag)
values("What other data analysis tools/languages have you used (SAS, Python, Excel, TI Calculator, etc)", "text", "tools"); 

INSERT INTO polls(title, type, tag)
values("What would you most like to learn about R", "text", "goals");


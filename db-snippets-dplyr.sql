PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE snippets (
	snippet_id INTEGER PRIMARY KEY,
	title TEXT,
	code TEXT,
	status INTEGER NOT NULL DEFAULT 0,
	open_seq INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "snippets" VALUES(1,'Load packages','# install.packages("tidyverse")
library(tidyverse)
install.packages("nycflights13") 
library(nycflights13)

',0,0);
INSERT INTO "snippets" VALUES(2,'Filtering (all the same)','#dply
filter(flights, dest=="DTW" & month==6)
#base R
flights[flights$dest=="DTW" & flights$month==6, ]
subset(flights, dest=="DTW" & month==6)
',0,0);
INSERT INTO "snippets" VALUES(3,'Selecting Columns','select(flights, dep_time, arr_time, carrier)
select(flights, -year, -tailnum)
select(flights, month:dep_delay)
select(flights, starts_with("d"))
select(flights, ends_with("time"))
select(flights, contains("arr"))
select(flights, -starts_with("d"))
select(flights, flight, everything())
',0,0);
INSERT INTO "snippets" VALUES(4,'Chain/pipe operator','#these are the same
select(filter(flights, dest=="DTW"), carrier)
flights %>% filter(dest=="DTW") %>% select(carrier)
',0,0);
INSERT INTO "snippets" VALUES(5,'Sorting (arranging) data','flights %>% arrange(sched_dep_time)
flights %>% arrange(month, desc(day))
# by "delay"
flights %>% arrange(desc(dep_time-sched_dep_time ))
',0,0);
INSERT INTO "snippets" VALUES(6,'My First Mutate','flights %>%
  mutate(speed = distance/(air_time/60)) %>%
  arrange(desc(speed)) %>%
  select(flight, speed)
',0,0);
INSERT INTO "snippets" VALUES(7,'Create variables incrementally','flights %>% mutate(
    dist_km = distance * 1.61,
    hours = air_time / 60, 
    kph = dist_km/hours ) %>%
select(flight, kph)
',0,0);
INSERT INTO "snippets" VALUES(8,'Summarize','flights %>% 
    filter(!is.na(arr_delay)) %>%
    summarize(avg_arr_delay = mean(arr_delay))
',0,0);
INSERT INTO "snippets" VALUES(9,'Group By','flights %>% 
    filter(!is.na(arr_delay)) %>% 
    group_by(carrier) %>% 
    summarize(avg_arr_delay = mean(arr_delay))
',0,0);
INSERT INTO "snippets" VALUES(10,'Delay by carrier code','flights %>% 
    filter(!is.na(arr_delay)) %>% 
    group_by(carrier) %>% 
    summarize(avg_arr_delay = mean(arr_delay))
',0,0);
INSERT INTO "snippets" VALUES(11,'Delay by airline name','flights %>% 
    filter(!is.na(arr_delay)) %>% 
    group_by(carrier) %>% 
    summarize(avg_arr_delay = mean(arr_delay)) %>%
    left_join(airlines)
',0,0);
INSERT INTO "snippets" VALUES(12,'Subsetting','flights %>% distinct(tailnum, carrier)
flights %>% sample_n(3)
flights %>% slice(4:6)

',0,0);
INSERT INTO "snippets" VALUES(13,'Transforming','flights %>% count(carrier)
flights %>% 
    summarize_at(vars(ends_with("time")), mean, na.rm=T)
',0,0);
INSERT INTO "snippets" VALUES(14,'Windowing Functions','x<-1:5; lead(x); lag(x)
coalesce(c(NA,2,NA), c(1, NA, NA), 3)
recode(letters[1:10], b="boo")
',0,0);
COMMIT;

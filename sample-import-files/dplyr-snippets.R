
#! Function Tag
## function-syntax
round(14.752, digits=1)


#! Variable Syntax
## variable-syntax
fruit <- c("apples", "oranges", "bananas")
primes <- c(1, 2, 3, 5, 7, 11)
numbers <- 1:10
age <- 22
age <- age + 1

#! Load dplyr
## load-dplyr

library(dplyr)

#! Load Flight Data
## load-flights

library(nycflights13)

#! Filter flights
## filter-1
filter(flights, dest=="DTW" & month==6)

#! Count flights home
## filter-poll
filter(flights, dest=="   ")


#! Comparisons
## comparisons
filter(flights, month == 6)
filter(flights, month != 6)
filter(flights, month < 7)
filter(flights, month > 2)
filter(flights, month > 2 & month < 7)
filter(flights, month > 3 | month > 7)
filter(flights, month %in% c(1, 12))

#! Selecting Columns
## select-1
select(flights, dep_time, arr_time, carrier)
select(flights, -year, -tailnum)
select(flights, month:dep_delay)

#! Selecting Columns p2
## select-2
select(flights, starts_with("d"))
select(flights, ends_with("time"))
select(flights, contains("arr"))
select(flights, -starts_with("d"))
select(flights, flight, everything())
select(flights, where(is.character))

#! Select AND filter
## two-verbs
filtered <- filter(flights, dest=="DTW")
select(filtered, carrier)

select(filter(flights, dest=="DTW"), carrier)

#! Verb composition
## pipe

flights %>% 
  filter(dest == "DTW") %>% 
  select(carrier)

#! Make a pipe
## pipe-try

round(exp(sin(.5)),2)

#! Sort data
## arrange

flights %>% arrange(sched_dep_time)
flights %>% arrange(month, desc(day))
flights %>% arrange(desc(dep_time - sched_dep_time))

#! Final flight
## arrange-try

flights %>%
  filter(      ) %>%
  arrange(      ) %>%
  select(      )

#! Create New Variables
## mutate-1

flights %>% 
  mutate(speed = distance/(air_time/60)) %>% 
  arrange(desc(speed)) %>% 
  select(flight, speed)

new_flights <- flights %>% 
  mutate(speed = distance/(air_time/60)) %>% 
  arrange(desc(speed)) %>% 
  select(flight, speed)

#! Use New Variables
## mutate-2

flights %>% 
  mutate(dist_km = distance * 1.61, 
         hours = air_time / 60, 
         kph = dist_km/hours ) %>%
  select(flight, kph)


flights %>% summarize(avg_dist = mean(distance))


#! Summarize Date
## summarize-1

flights %>% 
  summarize(avg_dist = mean(distance))

#! Something's missing
## missing-1

flights %>% 
  summarize(avg_arr_delay = mean(arr_delay))

#! Add these numbers
## missing-2
x <- c(5, 12, 76)
sum(x)

#! Add these numbers
## missing-3
x <- c(9, 31, NA)
sum(x)
is.na(x)
sum(is.na(x))
sum(x, na.rm=TRUE)

#! Average Delay
## missing-4

flights %>% 
  filter( !is.na(arr_delay) ) %>%
  summarize(avg_arr_delay = mean(arr_delay))

flights %>% 
  summarize(avg_arr_delay = mean(arr_delay, na.rm=TRUE))

#! Min and max delay
## summarize-try

flights %>%
  filter(      ) %>%
  summarize(   ,   )

#! Group by summarize
## group_by-1

flights %>% 
  filter(!is.na(arr_delay)) %>% 
  group_by(carrier) %>% 
  summarize(avg_arr_delay = mean(arr_delay))

#! Group by mutate
## group_by-2

flights %>% 
  filter(!is.na(arr_delay)) %>% 
  group_by(carrier) %>% 
  mutate(avg_arr_delay = mean(arr_delay)) %>% 
  select(carrier, arr_delay, avg_arr_delay)

#! Multiple columns
## across
flights %>% 
  summarize(across(ends_with("time"), ~mean(.x, na.rm=T)))

#! Summary Exercise
## four-verb-try

flights %>%
  filter() %>%
  group_by() %>%
  summarize() %>%
  arrange()

#! Unknown Codes
## group_by-3

flights %>% 
  filter(!is.na(arr_delay)) %>% 
  group_by(carrier) %>% 
  summarize(avg_arr_delay = mean(arr_delay))
  
#! Airline codes
## airlines
airlines

#! Join flights to airlines
## left_join
flights %>% 
  filter(!is.na(arr_delay)) %>% 
  group_by(carrier) %>% 
  summarize(avg_arr_delay = mean(arr_delay)) %>%
  left_join(airlines)

#! Join by
## join_by

flights %>% inner_join(planes)

flights %>% inner_join(planes, by = "tailnum")

#! Count column values
## count
flights %>% 
  count(carrier)

#! Counting functions
## counting

flights %>% 
  group_by(tailnum) %>%
  summarize(
    routes = n_distinct(flight),
    flights = n()
  )

#! Subsetting
## subsetting
flights %>% slice_max(air_time, n=2)
flights %>% sample_n(3)
flights %>% distinct(year, month)

#! Lead and lag
## lead-lag

growth <- tibble(
  age = 2:9, 
  height = c(33.7, 37.0, 39.4, 42.2, 
             45.5, 47.7, 50.6, 52.7))
growth %>% 
  mutate(
    prevh = lag(height), 
    nexth = lead(height), 
    growth = height-prevh)

#! Conditional replacement
## if_else

flights %>%
  mutate(
    real_delay = if_else(arr_delay<0, 0, arr_delay)
  )

#! Function attempt
## bad-function

flights %>% 
  group_by(carrier) %>%
  summarize(delay=mean(arr_delay, na.rm=T))

avg_delay_by <- function(x) {
  flights %>% 
    group_by(x) %>%
    summarize(delay=mean(arr_delay, na.rm=T))
}
avg_delay_by(carrier)

#! Embracing variables
## embrace

avg_delay_by <- function(x) {
  flights %>% group_by({{x}}) %>%
    summarize(delay = mean(arr_delay, na.rm=T))
}
avg_delay_by(carrier)
avg_delay_by(month)

#! Rename output 
## new-col-names

avg_delay_by <- function(x) {
  flights %>% 
    filter(!is.na(arr_delay)) %>%
    group_by({{x}}) %>%
    summarize("{{x}}_delay" := mean(arr_delay))
}
avg_delay_by(carrier)

#! Rename output 
## survivor-data
#@ link

https://github.com/rfordatascience/tidytuesday/tree/master/data/2021/2021-06-01

#! dplyr Worksheet
## worksheet
#@ link

https://classroom.matthewflickinger.com/slides/dplyr_worksheet.pdf


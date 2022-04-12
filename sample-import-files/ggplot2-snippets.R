
#! Loading ggplot2
## ggplot2-load

library(ggplot2)

#! ggplot2 Cheat Sheet
## ggplot2-help
#@ link

https://github.com/rstudio/cheatsheets/raw/master/data-visualization-2.1.pdf

#! Gapminder
## gapminder-load

install.packages("gapminder")
library(gapminder)
View(gapminder)

#! Gapminder Data
## gapminder-view

gapminder

#! Start plot
## start-plot

ggplot(data = gapminder)

#! Add x
## add-x

ggplot(data = gapminder) + 
  aes(x = gdpPercap)

#! Add x label
## add-x-label

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita")

#! Add y
## add-y

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp)

#! Add y label
## add-y-label

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp) + 
  labs(y = "Life Expectancy")


#! Draw points
## add-points

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp) + 
  labs(y = "Life Expectancy") + 
  geom_point()

#! Color by continent
## add-color

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp) + 
  labs(y = "Life Expectancy") + 
  geom_point() + 
  aes(color=continent)

#! Size by population
## add-size

ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp) + 
  labs(y = "Life Expectancy") + 
  geom_point() + 
  aes(color=continent) + 
  aes(size = pop)

#! Small plots by year
## add-facets
ggplot(data = gapminder) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y = lifeExp) + 
  labs(y = "Life Expectancy") + 
  geom_point() + 
  aes(color=continent) + 
  aes(size = pop) + 
  facet_wrap(vars(year))

#! Filter plot data
## add-data-filter
gapminder %>%
  filter(
    year %in% c(1957, 2007)
  ) %>%
  ggplot(data = .) + 
  aes(x = gdpPercap) + 
  labs(x = "GDP per capita") + 
  aes(y =lifeExp) + 
  labs(y = "Life Expectancy") + 
  geom_point() + 
  aes(color=continent) + 
  aes(size = pop) + 
  facet_wrap(vars(year), nrow=2)


#! Reorganize code
## reorganize
gapminder %>%
  filter(
    year %in% c(1957, 2007)
  ) %>%
  ggplot(data = .) + 
  geom_point(mapping = aes(
    x = gdpPercap, y = lifeExp, 
    color=continent, size = pop)) + 
  facet_wrap(vars(year), nrow=2) + 
  labs(x = "GDP per capita", y = "Life Expectancy")

#! Aesthetics code
## aesthetics

# all the same
aes(gdpPercap, lifeExp)
aes(x = gdpPercap, y = lifeExp)
aes(y = lifeExp, x = gdpPercap)

#! Geom help
## geom-help

?geom_point
vignette("ggplot2-specs")

#! Change point shape
## shape-try

gap2007 <- gapminder %>%
  filter(year == 2007)

ggplot(data = gap2007) +
  aes(x = gdpPercap) +
  aes(y = lifeExp) + 
  geom_point() + 
  aes( <??> = <??> )

#! Non-mapped aesthetic values
## fixed-mappings

ggplot(data = gap2007) +
  aes(x = gdpPercap) +
  aes(y = lifeExp) + 
  geom_point(
    size = 3, 
    color = "blueviolet"
  )

#! Your favorite color
## color-try

colors()
sample(colors(), 10)

ggplot(data = gap2007) +
  aes(x = gdpPercap) +
  aes(y = lifeExp) + 
  geom_point(
    size = 3, 
    color = "   "
  )

#! Histogram
## histogram

ggplot(gap2007) + 
  aes(x=lifeExp) + 
  geom_histogram()

#! Density Plot
## density

ggplot(gap2007) + 
  aes(x=lifeExp) + 
  geom_density()

#! Density color
## density-color

ggplot(gap2007) + 
  aes(x=lifeExp) + 
  geom_density(color="firebrick")

#! Density fill
## density-fill

ggplot(gap2007) + 
  aes(x=lifeExp) + 
  geom_density(fill="firebrick")

#! Density fill
## density-fill

ggplot(gap2007) + 
  aes(x=lifeExp) + 
  geom_density(fill="firebrick")

#! Density groups
## density-groups

ggplot(gap2007) + 
  aes(x=lifeExp, fill=continent) + 
  geom_density(alpha=.2)

#! Box plots
## box-plot

ggplot(gap2007) + 
  aes(x=continent, y=lifeExp) + 
  geom_boxplot()

#! What is this geom
## geom-try

ggplot(gap2007) + 
  aes(x = continent) + 
  aes(y = lifeExp) + 
  geom_<???>()

#! Two geoms
## geom-stack
ggplot(gap2007) + 
  aes(x=continent, y=lifeExp) + 
  geom_violin() + 
  geom_jitter()

#! Change cross time
## time-points

ggplot(gapminder) + 
  aes(x=year, y=lifeExp) + 
  geom_point()

#! First attempt at lines
## time-lines-bad

ggplot(gapminder) + 
  aes(x=year, y=lifeExp) + 
  geom_line()

#! Time lines
## time-lines

ggplot(gapminder) + 
  aes(x=year, y=lifeExp) + 
  geom_line(aes(group=country))


#! Smoothing trends
## smoothing

ggplot(gap2007) + 
  aes(x=gdpPercap, y=lifeExp) + 
  geom_point() + 
  geom_smooth()

#! Smoothing linear trends
## smoothing-lm

ggplot(gap2007) + 
  aes(x=gdpPercap, y=lifeExp) + 
  geom_point() + 
  geom_smooth(method="lm")

#! Trend per continent
## smooth-try

ggplot(gapminder) + 
  aes(<??>) + 
  geom_<??>(<??>)

#! Bar charts
## bar-plot

ggplot(gap2007) + 
  aes(x=continent) + 
  geom_bar()

#! Calculating bar heights
## bar-plot-calc

gap2007 %>% 
  group_by(continent) %>% 
  summarize(avgle = mean(lifeExp)) %>% 
  ggplot() + 
  aes(x=continent, y=avgle) + 
  geom_col()

#! Stacked Bar Charts
## bar-plot-stacked-1

gapminder %>% 
  filter(year==2007 | year==1952) %>% 
  group_by(continent, year) %>% 
  summarize(avgle = mean(lifeExp)) %>% 
  ggplot() + 
  aes(x=continent, y=avgle) + 
  geom_col( aes(fill=year) )

#! Stacked Bar Charts 2
## bar-plot-stacked-2

gapminder %>% 
  filter(year==2007 | year==1952) %>% 
  group_by(continent, year) %>% 
  summarize(avgle = mean(lifeExp)) %>% 
  ggplot() + 
  aes(x=continent, y=avgle) + 
  geom_col( aes(fill=factor(year)) )

#! Side-by-side bars
## bar-plot-dodge

gapminder %>% 
  filter(year==2007 | year==1952) %>% 
  group_by(continent, year) %>% 
  summarize(avgle = mean(lifeExp)) %>% 
  ggplot() + 
  aes(x=continent, y=avgle) + 
  geom_col( aes(fill=factor(year)) , 
            position="dodge")

#! What does ggplot do?
## plot-assign

p <- ggplot(data = gap2007) + 
  aes(x = gdpPercap, y = lifeExp) + 
  geom_point()
# nothing happens until
p
print(p)

#! Different data on layers
## layer-data

to_label <- gap2007 %>% 
  filter(pop > 200000000)

gap2007 %>%
  ggplot() +
  aes(x=gdpPercap, y=lifeExp) + 
  geom_point(aes(size=pop, color=continent)) + 
  geom_text(aes(label=country), data=to_label) 

#! Facet Wrap
## facet-wrap

ggplot(gapminder) + 
  aes(x=lifeExp) +
  geom_density(fill="grey40") + 
  facet_wrap(vars(continent))

#! Facet Grid
## facet-grid

p <- gapminder %>% 
  mutate(decade=year%/%10*10) %>% 
  group_by(continent, decade, 
           country) %>% 
  select(-year) %>% 
  summarize_all(mean) %>% 
  ggplot() +
  aes(gdpPercap, lifeExp) + 
  geom_point()

p + facet_grid(rows=vars(decade), 
               cols=vars(continent))
p + facet_grid(rows=vars(decade))
p + facet_grid(cols=vars(continent))

#! Color Scales
## color-scales

p <- gapminder %>% 
  filter(country=="United States") %>% 
  ggplot(aes(gdpPercap, lifeExp))

# Compare output
p + geom_point(aes(color=year))
p + geom_point(aes(color=factor(year)))

#! Manual color scale
## scale_color_manual

p <- gapminder %>% 
  filter(country %in% c("Peru", "Italy")) %>% 
  ggplot(aes(year, lifeExp, color=country)) + 
  geom_line(size=3)

p + scale_color_manual(values=c(
  "Peru"="#F2CED8", 
  "Italy"="#88B8B8") )

p + scale_color_brewer(palette="Paired")

#! Add to color scale
## scale_color-try
grab <- c("Peru", "Italy")

gapminder %>% 
  filter(country %in% grab) %>% 
  ggplot(aes(year, lifeExp, color=country)) + 
  geom_line(size=3) +
  scale_color_manual(values=c(
    "Peru"="#F2CED8", 
    "Italy"="#88B8B8")
  )

#! Setting vs mapping
## setting-v-mapping

ggplot(gap2007) + 
  aes(gdpPercap, lifeExp) +
  geom_point(aes(color="darkblue"))

ggplot(gap2007) +
  aes(gdpPercap, lifeExp) +
  geom_point(color="darkblue")

#! Formatting axes labels
## axes-labels

ggplot(gap2007) + 
  aes(gdpPercap, pop) +
  geom_point() + 
  scale_x_continuous(labels = scales::dollar_format()) + 
  scale_y_continuous(
    breaks = scales::pretty_breaks(n=8),
    labels = scales::label_number_si(accuracy = .1))

#! Labeling your plot
## labels

ggplot(gap2007, aes(log10(pop), lifeExp)) + 
  geom_point() + 
  labs(
    title=expression(y==alpha+beta*x),
    x=expression(log[10]("Population")), 
    y="Life Expectancy (years)")

#! Setting a theme
## themes

p <- ggplot(gapminder) +
  aes(year, lifeExp, color = continent) + 
  geom_smooth(se = FALSE) + 
  ggtitle("My Plot!")

ggplot(gapminder, aes(year, pop)) + 
  geom_point()

#! ggsave
## ggsave

ggsave("plot.png", 
  ggplot(gap2007, aes(lifeExp)) + 
    geom_density()
)


#! Using ggplot with functions
## programming

# won't work
by_year <- function(y) {
  ggplot(gapminder, aes(year, y)) + 
    geom_point()
}
by_year(pop)

# works
by_year <- function(y) {
  ggplot(gapminder, aes(year, {{y}} )) + 
    geom_point()
}
by_year(pop)
by_year(lifeExp)

#! ggplot2 Worksheet
## worksheet
#@ link

https://classroom.matthewflickinger.com/s/ggplot2_worksheet.pdf


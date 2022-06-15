## Compute City/Block Group Crosswalk to convert
## vaccine data down to the Block Group level
library(tidyverse)
library(sf)

# Import City/Community Shapefiles
shapefile_city <- st_read("raw/city_2021.geojson")

# Import Block Group Shapefiles
shapefile_bg <- st_read("raw/bg_2019") %>%
  st_transform(4326) %>%
  filter(COUNTYFP == "037") %>%
  select(GEOID, ALAND)

# Calculate which city predominantly intersects
# with a block group
shapefile_bg %>%
  st_intersection(st_make_valid(shapefile_city %>%
                                  select(label))) %>%
  st_make_valid() %>%
  mutate(area = st_area(geometry),
         area_share = as.numeric(area / ALAND)) %>% 
  as_tibble() %>% 
  group_by(GEOID) %>% 
  slice(which.max(area_share)) %>% 
  as_tibble() %>% 
  ungroup() %>% 
  select(GEOID, label) %>% 
  rename(community = label) %>%
  write.csv('intermediate/city_bg_crosswalk.csv', row.names = FALSE)


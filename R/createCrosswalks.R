## Compute City/Block Group Crosswalk to convert
## vaccine data down to the Block Group level
library(tidyverse)
library(sf)

# Import City/Community Shapefiles
shapefile_city <- st_read("R/raw/city_2021.geojson")

# Import SPA 2021 Shapefiles
shapefile_sd_2021 <- st_read("R/raw/sd_2021.geojson")

# Import Block Group Shapefiles
shapefile_bg <- st_read("R/raw/bg_2019") %>%
  st_transform(4326) %>%
  filter(COUNTYFP == "037") %>%
  mutate(ALAND = st_area(geometry)) %>%
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
  write.csv('R/intermediate/city_bg_crosswalk.csv', row.names = FALSE)

# Calculate which Supervisors District predominantly intersects
# with a block group
shapefile_bg %>%
  st_intersection(st_make_valid(shapefile_sd_2021 %>%
                                  select(DistName))) %>%
  st_make_valid() %>%
  mutate(area = st_area(geometry),
         area_share = as.numeric(area / ALAND)) %>% 
  as_tibble() %>%
  group_by(GEOID) %>% 
  slice(which.max(area_share)) %>% 
  as_tibble() %>% 
  ungroup() %>%
  select(GEOID, DistName, area_share) %>% 
  rename(sd_2021 = DistName, sd_2021_area = area_share) %>%
  write.csv('R/intermediate/sd_2021_bg_crosswalk.csv', row.names = FALSE)

library(dplyr)
library(googlesheets4)

# Download vaccination data from DPH website
vaccinations_city <-
  read.csv(
    "http://publichealth.lacounty.gov/media/coronavirus/vaccine/data/tables/cair_pm_hosp_geocoded_city_totals.csv"
  ) %>%
  select("City.Community", X6..mos.pop..vaccinated....) %>%
  rename(
    city = 1,
    Current_Vaccination = 2
  ) %>%
  filter(Current_Vaccination < 1) %>%
  mutate(Current_Vaccination = sprintf("%.1f", Current_Vaccination * 100))

# Import the pre-calculated City/Block Group crosswalk
city_bg_crosswalk <-
  read.csv("R/intermediate/city_bg_crosswalk.csv", colClasses = "character")

# Import the outreach data from Google Sheet
gs4_deauth()
outreach_meta <-
  read_sheet("1A1TJRyiQTEN4eM5V9BLgXwrpNSCkKjue64TyYgJtxxM", sheet = "mastersheet") %>%
  select(
    GEOID,
    BG,
    Priority_Decile = Priority_decile,
    CSA_Name = Current_CSA_Name,
    Block_Code,
    Current_Agency,
    ZIP = ZIPCODE
  )

# Calculate outreach counts from the raw outreach frequencies
outreach_counts <- read_sheet("1A1TJRyiQTEN4eM5V9BLgXwrpNSCkKjue64TyYgJtxxM", sheet = "outreaches")

outreach <- outreach_counts %>%
  mutate(Current_Outreach_Date = names(.)) %>%
  rename(block = 1) %>%
  filter(nchar(as.character(block)) == 4) %>%
  group_by(block, Current_Outreach_Date) %>%
  summarize(Current_Outreach = n()) %>%
  merge(outreach_meta, by.x = "block", by.y = "Block_Code", all.y = TRUE) %>%
  rename(Block_Code = block)

# Grab acs population data by block groups
demographics <- read.csv("R/raw/acs_bg.csv", colClasses = "character") %>%
  select(-vac_per)

# Merge all data and output for consumption by website
final <- city_bg_crosswalk %>%
  left_join(outreach, by = "GEOID") %>%
  left_join(demographics, by = "GEOID") %>%
  left_join(vaccinations_city, by = c("community" = "city")) %>%
  select(-community, -Priority_Decile) %>%
  mutate(Current_Vaccination_Date = format(Sys.Date(), "%b %d, %Y"))

write.csv(final, "data/merged_vaccination_data.csv", row.names = FALSE, na = "")

final %>%
  select(GEOID, CSA_Name, Block_Code, Current_Agency, Current_Outreach, Current_Outreach_Date, ZIP) %>%
  write.csv("data/merged_vaccination_locate_data.csv", row.names = FALSE, na = "")

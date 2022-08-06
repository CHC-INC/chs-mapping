library(dplyr)
library(googlesheets4)

# Download vaccination data from DPH website
vaccinations_city <-
  read.csv(
    "http://publichealth.lacounty.gov/media/coronavirus/vaccine/data/tables/cair_pm_hosp_geocoded_city_totals.csv"
  ) %>%
  select(1, 4) %>%
  rename(city = 1,
         Current_Vaccination = 2) %>%
  filter(Current_Vaccination < 1) %>%
  mutate(Current_Vaccination = sprintf('%.1f', Current_Vaccination * 100))

# Import the pre-calculated City/Block Group crosswalk
city_bg_crosswalk <-
  read.csv("R/intermediate/city_bg_crosswalk.csv", colClasses = "character")

# Import the outreach data from Google Sheet
gs4_deauth()
outreach <-
  read_sheet("1A1TJRyiQTEN4eM5V9BLgXwrpNSCkKjue64TyYgJtxxM", sheet = "mastersheet") %>%
  select(
    GEOID,
    BG,
    Priority_Decile = Priority_decile,
    CSA_Name = Current_CSA_Name,
    Block_Code,
    Current_Agency,
    Current_Outreach,
    Current_Outreach_Date,
    ZIP = ZIPCODE
  )

# Merge all data and output for consumption by website
city_bg_crosswalk %>%
  left_join(outreach, by = "GEOID") %>%
  left_join(vaccinations_city, by = c("community" = "city")) %>%
  select(-community) %>%
  mutate(Current_Vaccination_Date = format(Sys.Date(), "%b %d, %Y")) %>%
  write.csv("data/merged_vaccination_data.csv", row.names = FALSE, na="")

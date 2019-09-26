# uiuc-food
The following is a data exploration of all restaurants, cafes, etc. in and around the UIUC campus and the greater Champaign County area. The project was inspired by attempting to eat at all the eateries local to the Champaign-Urbana area while attending the University of Illinois. The visualization was inspired by one of Professor Wade Fagen-Ulmschneider's data discoveries: [Every Gen Ed at UIUC, by GPA](http://waf.cs.illinois.edu/discovery/every_gen_ed_at_uiuc_by_gpa/).

## Dataset
The dataset used for the visualization portion of this project can be found at `visualization/res/dataset_v2.json`.

The dataset used for this project was compiled through the use of OCR on a [PDF]((https://adobeindd.com/view/publications/abe7ee98-a01b-4424-93ef-565d0e778bf9/1/publication-web-resources/pdf/Experience_Guide_2019.pdf) of a "The Greater Champaign County Area Magazine" issue to obtain eatery names, addresses, cuisines, phone numbers, areas, and websites. This was followed by geocoding to convert the addresses to coordinates and making automated Google queries to obtain rating, review, and price information.

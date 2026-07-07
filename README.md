The following repo is a project for the founding product engineering role at Downshift, the goal of this repo is to demonstate a process of 0 to 1 product thinking. 
I will be outlinining the steps taken from the given idea/artifacts to development and deployment.

1. Extract items file for a database creation.  

I am choosing to transfer the JSON file into an SQLite DB as it is a semi large corpus of information with multiple columns and some nested structures. I have more granularity 
over what data I can access within the application and SQLite is a lightweight easy to use database in this case as the app isn't going to be deployed at a larger scale. It also maps over easily from 
JSON and is perfect for local testing/development. 

-I extract the public JSON url of the given products into a new file within this directory as "products.json" via:

curl -L "https://media.downshift.app/hiring/founding-engineer/items.json" \
  -o products.json
ls -lat products.json
>>> -rw-r--r--  1 abineetsingh  staff  1411931 Jul  6 20:40 products.json

-Validate the file to see that all the entries were successfully transfered

jq 'length' products.json
>>> 4000

-Validate all unique primary keys which will be mapped over in the DB creation

jq -r 'map(keys) | add | unique[]' products.json

>>> brand
category
description
id
image
imageHeight
imageWidth
inStock
price
rating
releasedAt
reviews
tags
title

-Examine a random entry to see the JSON structure overall with some example values for each key 

jq '.[464]' products.json 

{
  "id": 465,
  "title": "Handwoven Glass Lantern",
  "brand": "Norlund",
  "category": "Lighting",
  "tags": [
    "glass",
    "lighting"
  ],
  "price": 1555.57,
  "rating": 4.6,
  "reviews": 517,
  "inStock": true,
  "releasedAt": "2025-11-19",
  "image": "https://picsum.photos/seed/cat465/500/320",
  "imageWidth": 500,
  "imageHeight": 320,
  "description": "Handcrafted Glass lantern with a handwoven finish."
}

-Create a new SQLite DB from the products.json

sqlite-utils insert products.db items products.json --pk id --detect-types --batch-size 1000
>>>  [####################################]  100%

-Check health status of DB completion, primary keys 
sqlite-utils tables products.db
>>> [{"table": "items"}]

sqlite3 products.db "PRAGMA integrity_check;"
>>> ok

sqlite3 products.db "SELECT COUNT(*) AS imported_rows FROM items;"
>>> 4000

sqlite3 products.db "SELECT COUNT(*) AS null_ids FROM items WHERE id IS NULL;"
>>> 0

sqlite3 products.db "PRAGMA table_info(items);"
>>> 0|id|INTEGER|0||1
1|title|TEXT|0||0
2|brand|TEXT|0||0
3|category|TEXT|0||0
4|tags|TEXT|0||0
5|price|TEXT|0||0
6|rating|FLOAT|0||0
7|reviews|INTEGER|0||0
8|inStock|INTEGER|0||0
9|releasedAt|TEXT|0||0
10|image|TEXT|0||0
11|imageWidth|INTEGER|0||0
12|imageHeight|INTEGER|0||0
13|description|TEXT|0||0

-Get a random sample of rows for integrity check and access the db within sqlite console and get elements of a row.

sqlite3 -header -column products.db "SELECT * FROM items ORDER BY RANDOM() LIMIT 5;"

id    title                       brand        category   tags                                         price    rating  reviews  inStock  releasedAt  image                                       imageWidth  imageHeight  description                                          
----  --------------------------  -----------  ---------  -------------------------------------------  -------  ------  -------  -------  ----------  ------------------------------------------  ----------  -----------  -----------------------------------------------------
1795  Handwoven Glass Shelf Unit  Cove + Co    Furniture  ["furniture", "glass", "handwoven", "unit"]  751.07   4.7     910      1        2021-12-15  https://picsum.photos/seed/cat1795/400/400  400         400          Handcrafted Glass shelf unit with a handwoven finish.
2491  Compact Ceramic Vase        Briar Goods  Decor      ["ceramic", "compact", "decor", "vase"]      209.96   3.5     1319     1        2022-04-16  https://cdn.catalog.example/img/2491.jpg    400         300          A Compact Ceramic vase for everyday use.             
1586  Vintage Bamboo Poster       Fenwick      Wall Art   ["bamboo", "poster", "vintage", "wall art"]  122.56   4.2     466      1        2025-06-19  https://picsum.photos/seed/cat1586/300/400  300         400                                                               
1962  Modern Walnut Bench         Tundra       Furniture  ["furniture", "walnut"]                      1221.28          0        1        2022-11-16  https://picsum.photos/seed/cat1962/400/300  400         300          A Modern Walnut bench for everyday use.              
1342  Wide Brass Serving Tray     Pallas       Kitchen    ["kitchen", "wide"]                          1829.91  4.6     1564     1        2024-03-09  https://picsum.photos/seed/cat1342/400/400  400         400          A Wide Brass serving tray for everyday use.          

sqlite> SELECT title, brand, category, tags, price, description FROM items WHERE id = 747;
Stackable Terracotta Cushion Cover|Orla & Vine|Textiles|["stackable", "textiles"]|922.64|Our best-selling cushion cover, now in Terracotta.



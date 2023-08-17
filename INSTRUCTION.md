# Migrate data from V4 to V3
1. Start strapi v3 with empty database to get data structure and stop server
2. Start strapi V4 with command
    `NODE_OPTIONS="--max-old-space-size=8192" yarn dev`

3. Run function `getRelationship()` in file `index.js` to get V3 content-types relationship

4. Run function `remapModel()` in file `index.js` to mapping V4 api routes to V3 api routes

5. Run function `crawlData()` in file `index.js` to crawl to crawl all data from V4 and store to folder `data`

6. Run function `migrateCollectionType()` in file `index.js` to migrate collection type data in folder `data` to v3

7. Run function `mappingRelationship()` in file `index.js` map relationship id from v4 to v3

7. Run function `migrateUserPassword()` in file `index.js` to migrate user password from v4 database to v3 database


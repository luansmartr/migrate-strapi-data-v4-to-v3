const {getRelationship} = require('./getRelationship-v22')
const {crawlData} = require("./v4")
const {migrateCollectionType, migrateRelationship} = require("./v3")
const fs = require('fs')
require('dotenv').config()

// ===== STEP 1 =====
// getRelationship()
// ===== STEP 2 =====
crawlData()


// ===== STEP 3 =====
// migrateCollectionType()


// ===== STEP 4 =====
// migrateRelationship()
// fs.readdir('./data/',(error,files) => {
//     if(error){
//     console.log("🚀 ===== fs.readdirSync ===== error:", error);
//     }else{
//         console.log('files',files)
//     }
// })
// fs.readFile('./relationships.json',(error,files) => {
//     if(error){
//     console.log("🚀 ===== fs.readdirSync ===== error:", error);
//     }else{
//         console.log('files',files)
//     }
// })
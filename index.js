const {getRelationship} = require('./getRelationship-v22')
const {crawlData} = require("./v4")
const {migrateCollectionType, migrateRelationship, migrateUserPassword} = require("./v3")
const fs = require('fs')
const remapModel = require('./remapModel')
const {formatRelationshipMapping} = require('./formatRelationshipMapping')
const { mappingRelationship } = require('./mappingRelationship')
require('dotenv').config()

// getRelationship()

// remapModel()

// crawlData()

// migrateCollectionType()

// mappingRelationship()

migrateRelationship()

// migrateUserPassword()
const fs = require('fs')
const { isArray, kebabCase } = require('lodash')
const pluralize = require('pluralize')

const mappingRelationship = async () => {
    try{
        const files = fs.readdirSync('./relationshipMapping')
        console.log("🚀 ===== mappingRelationship ===== files:", files);
        for(let file of files){
            console.log("🚀 ===== mappingRelationship ===== file:", file);
            let collectionType = await fs.readFileSync(`./relationshipMapping/${file}`)
            collectionType = Object.entries(JSON.parse(collectionType))
            let relationshipForMigrate=[]
            for(let [collectionTypeV4ID, value] of collectionType){
                let newRelationship = {}
                for(let [relationship, v4ID] of Object.entries(value?.relationship)){
                    console.log("🚀 ===== mappingRelationship ===== v4ID:", v4ID);
                    let relationshipData = await fs.readFileSync(`./relationshipMapping/${pluralize.plural(kebabCase(relationship))}.json`)
                    relationshipData = JSON.parse(relationshipData)
                    let newID=null
                    if(!isArray(v4ID)) newID = relationshipData?.[v4ID]?.v3ID
                    else newID = v4ID?.map((item) => relationshipData?.[item]?.v3ID)
                    newRelationship[relationship]=newID
                }
                relationshipForMigrate.push({
                    v3ID: value?.v3ID,
                    relationship: newRelationship
                })
            }
            await fs.writeFileSync(`./relationshipForMigrate/${file}`,JSON.stringify(relationshipForMigrate))
        }
    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
module.exports={mappingRelationship}

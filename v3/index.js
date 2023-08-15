const Strapi = require('strapi-sdk-js')
const fs = require('fs');
const { pick, map, omit } = require('lodash');
const URL='http://localhost:1337'
const JWT ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkyMDk3NTUyLCJleHAiOjE2OTQ2ODk1NTJ9.YipybumzNrTYnp4gROqgFBAQlqNa4RoBz_626xTq2kw" 
const strapi = new Strapi({
  url: URL,
  prefix: "/",
  store: {
    key: "strapi_jwt",
    useLocalStorage: false,
    cookieOptions: { path: "/" },
  },
  axiosOptions: {
    headers: {
        'Authorization':`Bearer ${JWT}`
    }
  },
});
// let relationship = {
//     forms: ['internal_quiz_questions'],
//     'form-questions': ['internal_quiz_question_options']
// }
// const relationship = {
//     "forms": [],
//     "form-questions":['internal_quiz'],
//     "form-question-options": ['internal_quiz_question','internal_quiz_answer'],
//     "form-results": ['internal_quiz','learner_profile'],
//     "form-answers": ['internal_quiz_result','internal_quiz_question','learner_profile'],
//     "internal-quiz-answer-options": ['internal_quiz_answer','internal_quiz_question_option']
// }
// let migratedRelationship = {
//     forms:[]
//     // forms: [
//     //     {
//     //         id:1,
//     //         relationship:{
//     //             'internal_quiz_questions': [1,2,3],
//     //             'organization': 12
//     //         }
//     //     }
//     // ]
// }
const migrateCollectionType = async () => {
    try{
        let files = await fs.readdirSync('./data/')
        let relationship = await fs.readFileSync('./goodRelationships.json')
        relationship = JSON.parse(relationship)
        console.log("🚀 ===== migrateCollectionType ===== files:", files);
        for(let file of files){
            let _data = await fs.readFileSync(`./data/${file}`, {
                encoding:"utf-8"
            })
            _data = JSON.parse(_data)
            const model = file.split('.')?.[0]
            let relationshipForMigrate = []
            for(let data of _data){
                try{
                    console.log(`===== ${model} ===== ${data?.id}`)
                    // const [model, data] = collectionType
                    console.log("🚀 ===== migrate ===== item:", omit(data,[...relationship[model],'id']));
                    let createdItem = await strapi.create(model, omit(data,[...relationship[model],'id']))
                    relationshipForMigrate.push({
                            id: createdItem?.id,
                            relationship: relationship[model].reduce((pre, current) => {
                                let ids = map(data[current],'id')
                                return {
                                    ...pre,
                                    [current]:ids
                                }
                            },{})
                    })
                }catch(error){
                    continue
                }
            }
            await fs.writeFileSync(`./relationshipForMigrate/${model}.json`, JSON.stringify(relationshipForMigrate))
            // await fs.writeFileSync('migratedRelationship.json', JSON.stringify(migratedRelationship) )
            // console.log('relationshipUpdate', relationshipForUpdate)
            // console.log("🚀 ===== migrate ===== data:", JSON.parse(data)?.forms);
            // let response = await strapi.find('forms', {
            //     _limit:1
            // })

        }
    }catch(error){
    console.log("🚀 ===== migrate ===== error:", error?.original?.data?.errors);
    console.log("🚀 ===== migrate ===== error:", error);

    }
}
const migrateRelationship = async () => {
    try{
        const files = await fs.readdirSync('./relationshipForMigrate')
        for(let file of files){
            let _data = await fs.readFileSync(`./relationshipForMigrate/${file}`,{
                encoding: 'utf-8'
            })
            _data = JSON.parse(_data)
            const model = file.split('.')?.[0]
            for(let collectionType of _data){
                console.log(`======= ${model} ===== ${collectionType?.id}`)
                await strapi.update(model, collectionType?.id, collectionType?.relationship)
            }
        }
        // let relationshipMapping = await fs.readFileSync('./migratedRelationship.json', {
        //     encoding: 'utf-8'
        // })
        // relationshipMapping = Object.entries(JSON.parse(relationshipMapping))
        // for(let collectionType of relationshipMapping){
        //     const [model, data] = collectionType
        //     for(let item of data) {
        //         await strapi.update(model, item?.id, item?.relationship)
        //     }
        // }

    }catch(error){
        console.log("🚀 ===== migrateRelationship ===== error:", error);
    }
}
// migrateCollectionType()
// migrateRelationship()
module.exports={migrateCollectionType, migrateRelationship}
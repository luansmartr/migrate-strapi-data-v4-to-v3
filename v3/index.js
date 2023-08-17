const Strapi = require('strapi-sdk-js')
const fs = require('fs');
const { pick, map, omit, isArray, isEmpty } = require('lodash');
const { default: knex } = require('knex');
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
const dbV4 = knex({
    useNullAsDefault: true,
    client:'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'luandatabase',
      database: 'optimize-v2',
    },
})
const dbV3 = knex({
    useNullAsDefault: true,
    client:'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'luandatabase',
      database: 'migrate_v4-3_2',
    },
})
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
        let files = await fs.readdirSync('./data/application')
        let relationship = await fs.readFileSync('./relationships.json')
        relationship = JSON.parse(relationship)
        console.log("🚀 ===== migrateCollectionType ===== files:", files);
        for(let file of files){
            let _data = await fs.readFileSync(`./data/application/${file}`, {
                encoding:"utf-8"
            })
            _data = JSON.parse(_data)
            const model = file.split('.')?.[0]
            let relationshipForMigrate = {}
            for(let data of _data){
                try{
                    console.log(`===== ${model} ===== ${data?.id}`)
                    // const [model, data] = collectionType
                    console.log("🚀 ===== migrate ===== item:", omit(data,[...relationship[model],'id']));
                    if(model==='users') {
                        // let query=await dbV4('public.up_users').where('id', data?.id)
                        // console.log("🚀 ===== migrateCollectionType ===== query:", query);
                        // data.password=query.password
                        data.password='123456'
                    }
                    let createdItem = await strapi.create(model, omit(data,[...relationship[model],'id']))
                    // relationshipForMigrate.push({
                    //         v4ID: data?.id,
                    //         v3ID: createdItem?.id,
                    //         relationship: relationship[model].reduce((pre, current) => {
                    //             let value=null
                    //             if(isArray(data[current])) value=map(data[current],'id')
                    //             else value=data[current]?.id
                    //             return {
                    //                 ...pre,
                    //                 [current]:value
                    //             }
                    //         },{})
                    // })
                    relationshipForMigrate[data?.id]={
                            v4ID: data?.id,
                            v3ID: createdItem?.id,
                            relationship: relationship[model].reduce((pre, current) => {
                                let value=null
                                if(isArray(data[current])) value=map(data[current],'id')
                                else value=data[current]?.id
                                return {
                                    ...pre,
                                    [current]:value
                                }
                            },{})
                    }
                }catch(error){
                    console.log("🚀 ===== migrateCollectionType ===== error:", error);
                    continue
                }
            }
            await fs.writeFileSync(`./relationshipMapping/${model}.json`, JSON.stringify(relationshipForMigrate))
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
                console.log(`======= ${model} ===== ${collectionType?.v3ID}`)
                await strapi.update(model, collectionType?.v3ID, collectionType?.relationship)
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
const migrateUserPassword = async () => {
    try{
        let users = await fs.readFileSync('./relationshipMapping/users.json',{
            encoding: 'utf-8'
        })
        users = JSON.parse(users)
        for(let user of users){
            const query = await dbV4('public.up_users').where('id',user?.v4ID)
            if(!isEmpty(query)){
                console.log("🚀 ===== migrateUserPassword ===== query:", query);
                await dbV3('public.users-permissions_user').where('id', user?.v3ID).update({password:query?.[0]?.password})
            }
        }
    }catch(error){
        console.log("🚀 ===== migrateUserPassword ===== error:", error);
    }
}
// migrateCollectionType()
// migrateRelationship()
module.exports={migrateCollectionType, migrateRelationship, migrateUserPassword}
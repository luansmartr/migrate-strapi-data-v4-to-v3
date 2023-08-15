const Strapi = require('strapi-sdk-js')
const fs = require('fs');
const { isEmpty } = require('lodash');
const path = require('path')
const URL='http://localhost:1337'
const JWT ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkyMTEyNjE2LCJleHAiOjE2OTQ3MDQ2MTZ9.izYIfFbX46zcqVAPFamcmSq-yLYZIe49YKpf5u7NE-w" 
const BATCH_SIZE=100
const PAGE_SIZE=100
const strapi = new Strapi({
  url: URL,
  prefix: "/api",
  store: {
    key: "strapi_jwt",
    useLocalStorage: false,
    cookieOptions: { path: "/" },
  },
});
const configRelationship = {
    "forms": {
        "internal_quiz_questions": {
            model: "form-questions"
        }
    },
    "form-questions": {
        "internal_quiz_question_options": {
            model: "form-question-options"
        }
    }

}
// const relationship = {
//     "forms": [],
//     "form-questions":['internal_quiz'],
//     "form-question-options": ['internal_quiz_question','internal_quiz_answer'],
//     "form-results": ['internal_quiz','learner_profile'],
//     "form-answers": ['internal_quiz_result','internal_quiz_question','learner_profile'],
//     "internal-quiz-answer-options": ['internal_quiz_answer','internal_quiz_question_option']
// }
// const relationship = {
//     // "forms": ['internal_quiz_questions','internal_quiz_results','material','organization'],
//     // "form-questions":['internal_quiz_answer','internal_quiz_question_options','internal_quiz','option_answer_key'],
//     // "form-question-options": ['internal_quiz_question','internal_quiz_answer_options'],
//     // "form-results": ['internal_quiz','internal_quiz_answers','learner_profile'],
//     "form-answers": ['internal_quiz_result','internal_quiz_question','internal_quiz_answer_options'],
//     "internal-quiz-answer-options": ['internal_quiz_answer','internal_quiz_questions_options']
// }
const data={}
const countEntries = async (model)=> {
    let response = await strapi.find(model, {
        pagination: {
            start:0,
            limit:1
        }
    })
    return response?.meta?.pagination?.total
}
const countPages = async (model)=> {
    let response = await strapi.find(model, {
        pagination: {
            start:0,
            limit:1
        }
    })
    return Math.ceil(response?.meta?.pagination?.total/PAGE_SIZE)
}
const crawlApplication = async () => {
    try{
        let relationship = await fs.readFileSync('./relationships.json')
        let remapV4EndpointToV3 = await fs.readFileSync('./remapV4EndpointToV3.json')
        console.log("🚀 ===== crawlData ===== relationship:", relationship);
        // const config = Object.entries(JSON.parse(relationship))
        const remaps = Object.entries(JSON.parse(remapV4EndpointToV3))
        relationship  = JSON.parse(relationship)
        for(let remap of remaps){
            console.log("🚀 ===== crawlApplication ===== remap:", remap);
            const [v4, v3] = remap
            const modelRelationship = relationship[v3]
            const populate = !isEmpty(modelRelationship)? modelRelationship.reduce((pre,current) => {
                return {
                    ...pre,
                    [current]: {
                        fields:['id']
                    }
                }
            },{}):{}
            const pages = await countPages(v4)
            let fetchedData = []
            for(let page=1;page<=pages;page++){
                console.log('======MODEL====  ', v4)
                console.log("🚀 ===== main ===== page:", page);
                console.log("🚀 ===== main ===== start:", page-1);
                console.log("🚀 ===== main ===== total:", (page-1)*BATCH_SIZE);
                await fs.writeFileSync(`./tracking/${v3}.json`, JSON.stringify({
                    currentPage: page,
                    totalPage: pages
                }))
                let response = await strapi.find(v4, {
                    pagination: {
                        page: page,
                        pageSize: 100
                    },
                    sort: ['id:asc'],
                    ...(!isEmpty(populate)?{populate:populate}:{})
                })
                fetchedData.push(...response.data)
                response=null
            }
            await fs.writeFileSync(`./data/application/${v3}.json`, JSON.stringify(fetchedData))
            fetchedData=[]
        }

        // for(let i=0;i<config?.length; i++){
        //     const [model, modelRelationship] = config[i]
        //     const populate = modelRelationship.reduce((pre,current) => {
        //         return {
        //             ...pre,
        //             [current]: {
        //                 fields:['id']
        //             }
        //         }
        //     },{})
        //     const pages = await countPages(model)
        //     let fetchedData = []
        //     for(let page=1;page<=pages;page++){
        //         console.log('======MODEL====  ', model)
        //         console.log("🚀 ===== main ===== page:", page);
        //         console.log("🚀 ===== main ===== start:", page-1);
        //         console.log("🚀 ===== main ===== total:", (page-1)*BATCH_SIZE);
        //         await fs.writeFileSync(`./tracking/${model}.json`, JSON.stringify({
        //             currentPage: page,
        //             totalPage: pages
        //         }))
        //         let response = await strapi.find(model, {
        //             pagination: {
        //                 page: page,
        //                 pageSize: 100
        //             },
        //             sort: ['id:asc'],
        //             ...(!isEmpty(populate)?{populate:populate}:{})
        //         })
        //         fetchedData.push(...response.data)
        //         response=null
        //     }
        //     await fs.writeFileSync(`./data/application/${model}.json`, JSON.stringify(fetchedData))
        //     fetchedData=[]
        // }
    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
const crawlData = async() => {
    try{
        await crawlApplication()
    }catch(error){
        console.log("🚀 ===== crawlData ===== error:", error);
    }
}
// main()
module.exports={crawlData}
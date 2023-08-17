const fs = require('fs');
const { pick, map, omit, kebabCase } = require('lodash');
const { default: axios } = require('axios');
const pluralize = require('pluralize');
const URL='http://localhost:1337'
const JWT ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkyMDk3NTUyLCJleHAiOjE2OTQ2ODk1NTJ9.YipybumzNrTYnp4gROqgFBAQlqNa4RoBz_626xTq2kw" 
const axiosClient = axios.create({
    baseURL:URL,
    headers:{
        "Authorization": `Bearer ${JWT}`
    }
})
// This function will get all models their relationship from v3
const main = async () => {
    try{
        const response = await axiosClient.get('/content-manager/content-types')
        let contentTypes = response.data.data
        let relationship = contentTypes?.filter((item) => {
            return item?.uid?.includes('application::') || item?.uid==='plugins::users-permissions.user'
        }).reduce((pre,current) => {
            const modelRelationship = Object.entries(current?.attributes)?.filter(([key,_value]) => _value?.model || _value?.collection)?.map(([key]) => key)
            if(current?.uid?.includes('application::')){
                const tableName = kebabCase(pluralize.plural(current?.uid?.split('.')[1]))
                return {
                    ...pre,
                    [tableName]: modelRelationship

                } 
            }else{
                return {
                    ...pre,
                    'users':modelRelationship
                }
            }
        }, {})
        console.log('len', Object.keys(relationship).length)
        await fs.writeFileSync('relationships.json', JSON.stringify(relationship))
    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
main()
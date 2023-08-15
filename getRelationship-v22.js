const knex=require('knex')
const pg=require('pg')
const fs = require('fs')
const { kebabCase } = require('lodash')

const DATABASE_HOST="127.0.0.1"
const DATABASE_PORT="5432"
const DATABASE_USER="postgres"
const DATABASE_PASSWORD="luandatabase"
const DATABASE_DATABASE="smartr-production-26072023"
const DATABASE_SCHEMA="public"
const DATABASE_CLIENT="pg"

const db = knex({
  client: DATABASE_CLIENT,
  useNullAsDefault: true,
  connection: {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_DATABASE,
  },
});

const getRelationship = async () => {
    try{
        const modelsDefs = await db(DATABASE_SCHEMA+'.'+'core_store').where(
            'key',
            'like',
            'model_def_application%'
        );
        const relationships = modelsDefs?.map((item) => JSON.parse(item?.value))?.reduce((pre,value) => {
            // const value=current?.value
            console.log("🚀 ===== relationships ===== value:", value);
            const relationship = Object.entries(value?.attributes)?.filter(([key,_value]) => _value?.model || _value?.collection)?.map(([key]) => key)
            return {
                ...pre,
                [kebabCase(value?.collectionName)]: relationship
            }
        },{})
        await fs.writeFileSync('relationships.json', JSON.stringify(relationships))
        console.log("🚀 ===== relationships ===== relationships:", relationships);

    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
module.exports={getRelationship}
const fs  = require('fs')
const formatRelationshipMapping = async () => {
    try{
        let files= await fs.readdirSync('./relationshipMapping')
        for(let file of files){
            console.log("🚀 ===== main ===== file:", file);
            let data = await fs.readFileSync(`./relationshipMapping/${file}`,{encoding: 'utf-8'})    
            data = JSON.parse(data)
            data = data.reduce((pre,current) => {
                return {
                    ...pre,
                    [current?.v4ID]: current
                }
            },{})
            await fs.writeFileSync(`./formattedRelationshipMapping/${file}`,JSON.stringify(data))
        }
    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
module.exports={formatRelationshipMapping}
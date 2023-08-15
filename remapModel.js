const fs = require('fs');
const { pick, map, omit, kebabCase } = require('lodash');
const { default: axios } = require('axios');
const pluralize = require('pluralize');
const URL='http://localhost:1337'
const JWT ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkyMTEzMTA0LCJleHAiOjE2OTQ3MDUxMDR9.KlA0uiWSHi0I52hKGavsXwGv1G1RQHDy0UdVFj_NHSk" 
const axiosClient = axios.create({
    baseURL:URL,
    headers:{
        "Authorization": `Bearer ${JWT}`
    }
})
const main = async () => {
    try{
        const response = await axiosClient.get('/users-permissions/routes')
        let routes = response.data.routes
        console.log("🚀 ===== main ===== routes:", routes);
        let remapV4EndpointToV3 = Object.entries(routes)?.reduce((pre,[key,value]) => {
            let v4Endpoint=''
            if(key?.includes('api::')){
                v4Endpoint = value?.[0]?.path.split('/')[2]
                console.log("🚀 ===== remapV4EndpointToV3 ===== v4Endpoint:", v4Endpoint);
            }else if(key==='plugin::users-permissions'){
                v4Endpoint = 'users'
            }else return pre
            return {
                ...pre,
                [v4Endpoint]: pluralize.plural(v4Endpoint)
            }

        },{})
        await fs.writeFileSync('remapV4EndpointToV3.json', JSON.stringify(remapV4EndpointToV3))
    }catch(error){
        console.log("🚀 ===== main ===== error:", error);
    }
}
main()
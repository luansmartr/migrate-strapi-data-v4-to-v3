const knex = require('knex');

let additionalConfigV3 = {
  connection: {
    host: process.env.DATABASE_V3_HOST,
    port: process.env.DATABASE_V3_PORT,
    user: process.env.DATABASE_V3_USER,
    password: process.env.DATABASE_V3_PASSWORD,
    database: process.env.DATABASE_V3_DATABASE,
  },
};

let additionalConfigV4 = {
  useNullAsDefault: true,
  connection: {
    host: process.env.DATABASE_V4_HOST,
    port: process.env.DATABASE_V4_PORT,
    user: process.env.DATABASE_V4_USER,
    password: process.env.DATABASE_V4_PASSWORD,
    database: process.env.DATABASE_V4_DATABASE,
  },
};

const dbV3 = knex({
  client: 'pg',
  ...additionalConfigV3,
});

const dbV4 = knex({
  client: 'pg',
  ...additionalConfigV4,
});


module.exports = {
  dbV3,
  dbV4,
};

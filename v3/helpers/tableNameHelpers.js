
const resolveSourceTableName = (name) => {
    return process.env.DATABASE_V3_SCHEMA + '.' + name;
};

const resolveDestTableName = (name) => {
    return process.env.DATABASE_V4_SCHEMA + '.' + name;
};

module.exports = {
  resolveDestTableName,
  resolveSourceTableName,
};

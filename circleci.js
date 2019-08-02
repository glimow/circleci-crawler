const axios = require('axios');
const jsonfile = require('jsonfile');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'circleci';

const client = new MongoClient(url);

async function insertMany(db, objects) {
  objects.forEach(async object => {
    try {
      await db.collection('builds').insert(object);
    } catch (error) {
      // console.log(error);
      console.log('skip already existing ' + object.slug);
    }
  });
}

function buildUrl(run){
  return `https://circleci.com/api/v1.1/project/gh/pytorch/pytorch/${run}?circle-token=${process.env.CIRCLECI_TOKEN}`
};


async function retrieve_images_metadata() {
  await client.connect();
  console.log('Connected correctly to server');
  flag = false;
  const db = client.db(dbName);
  db.collection('builds').ensureIndex({ build_num: 1 }, { unique: true });
  response = await axios.get(`https://circleci.com/api/v1.1/project/gh/pytorch/pytorch?circle-token=${process.env.CIRCLECI_TOKEN}&limit=1&filter=completed`)
  
  const LIMIT = response.data[0].build_num

  console.log(LIMIT)
  do {
    console.log(`retrieving build ${num}`);
    try {
      const list = [...Array(100).keys()];
      
      response = await Promise.all(list.map(index=>axios.get(buildUrl(num+index))));
      await insertMany(db, response.map(el=>{
          delete el.data.circle_yml
          return el.data
        }));
    } catch (e) {
      console.log('failed at ' + num);
      console.error(e);
    }
    num = num + 1;
  } while (num < LIMIT)
}

retrieve_images_metadata().catch(e => {
  console.log(e);
});

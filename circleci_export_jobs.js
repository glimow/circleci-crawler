const jsonfile = require('jsonfile');
const MongoClient = require('mongodb').MongoClient;
const Timeout = require('await-timeout');
const csv = require('fast-csv')
const fs = require('fs')

const url = 'mongodb://localhost:27017';
const dbName = 'circleci';
const client = new MongoClient(url);
const csvStream = csv.format({ headers: [
      'build_num',
      'name',
      'index',
      'parallel',
      'failed',
      // 'bash_command',
      'status',
      'timedout',
      'continue',
      'end_time',
      'type',
      'allocation_id',
      'output_url',
      'start_time',
      'background',
      'exit_code',
      'insignificant',
      'canceled',
      'step',
      'run_time_millis',
      'has_output',
]})

const writeStream = fs.createWriteStream('jobs.csv');

csvStream.pipe(writeStream).on('end', process.exit);

const { Transform } = require('stream');

const processor = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  
  transform(image, encoding, callback) {
     for(const step of image.steps){
        for(const action of step.actions){
          action.build_num = image.build_num
          action.bash_command = JSON.stringify(action.bash_command)
          this.push(action);
        }
      }
    callback();
  }
});

async function retrieve_images_metadata() {
  
  await client.connect();

  console.log('Connected correctly to server');

  const db = client.db(dbName);
  
  const imagesStream = db.collection('builds').find().stream().pipe(processor).pipe(csvStream);
  // imagesStream.on("data", async function(image) {
  //   imagesStream.pause()
  //   try {
  //    for(const step of image.steps){
  //       for(const action of step.actions){
  //         action.build_num = image.build_num
  //         action.bash_command = JSON.stringify(action.bash_command)
  //         await csvStream.write(action)
  //       }
  //     }
  //     imagesStream.resume()
  //   } catch (error) {
  //     console.log(error.path ? `error ${error.path}`: error)
  //     imagesStream.resume()
  //   }
  // });

  imagesStream.on("end", function() {
    csvStream.end()
  });
}

retrieve_images_metadata().catch(e => {
  console.log(e);
});

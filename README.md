# Circleci API Crawler

Tiny crawler hacked to build a csv dataset out of circleci API. Build to retrieve all logs from pytorch/pytorch repository.

It contains two scripts, `circleci.js` for fetching the main dataset and storing it into mongodb, `circleci_export_jobs.js` to export nested tasks from the mongo database into a plain CSV file.

## Usage

Be sure to have nodejs+npm installed and mongodb up and running.
In the project root:

`bash
npm install
export CIRCLECI_TOKEN=\<your circleci api token\> node circleci.js
mongoexport --db circleci --collection builds --fieldFile fields --csv --out builds.csv
node --max-old-space-size=8192 circleci_export_jobs.js
`

You will obtain a `builds.csv` and a `jobs.csv` files. The jobs are the subtasks run during the builds and can be joined through the `build_num` column.

var debug = require('debug')('crowi:tool:page-import')
 , cli = require('cli')
 , mongoose = require('mongoose')
 ;

var mongoUri = process.env.MONGO_URI;

cli.setUsage('MONGO_URI=mongodb://user:password@host/dbname node bin/tool/page-import.js --file=FILE_NAME --path=\'/import\' \n\n  This means that all pages in MONGO_URI1 will be imported to under the path "/import".');
cli.parse({
    path: [false, 'Pages are import under the path.', 'string'],
    file: [false, 'Import data file.', 'string'],
    dry: [false, 'Dry run', 'boolean'],
});

/**
 * page import data format:
 *
 * [
 *  {
 *    "path": "/path/to/page",
 *    "body": "body of the page ...\nhoge fuga ...",
 *    "user": "email@example.com",
 *    "createdAt": "YYYY-mm-dd HH:MM:SS",
 *    "bookmarkUsers": [
 *      "email@example.com",
 *      ...
 *    ],
 *    "comments": [
 *      {
 *        "user": "email@example.com",
 *        "comment": "comment body",
 *        "createdAt": "YYYY-mm-dd HH:MM:SS"
 *      },
 *      ...
 *    ]
 *  },
 *  ...
 * ]
 */

cli.main(function(args, options)
{
  var app = {set: function(v) { }}
    , c = this
    , path = options.path
    , file = options.file
    , data = []
    ;

  if (!mongoUri) {
    cli.error('env "MONGO_URI" are required.\n');
    cli.output(cli.getUsage());
    cli.exit(1);
    return ;
  }

  if (!path || !file) {
    cli.error('option "path" and "file" are required.\n');
    cli.output(cli.getUsage());
    cli.exit(1);
    return ;
  }

  // load file
  try {
    if (file.match(/^\.+\.json$/)) {
      data = require(file);
    } else {
      data = require(process.cwd() + '/' + file);
    }

    if (!Array.isArray(data)) {
      throw new Error('Data file json is not an array.');
    }
  } catch (e) {
    cli.error('Counldn\'t open or load from file: ' + file);
    cli.error(e.message);
    cli.exit(1);
    return ;
  }


  mongoose.connect(mongoUri);

  // あー config 読み込み＆model読み込み周りを app.js から切り離さないといけないにゃぁ
  Promise.resolve()
  .then(function() {
    return new Promise(function(resolve, reject) {
      debug('Load config ...');
      configModel = require('../../lib/models/config')(app);
      configModel.loadAllConfig(function(err, doc) {
        return resolve();
      });
    })
  }).then(function() {
    models = require('../../lib/models')(app);
    models.Config = configModel;

    return Promise.resolve();
  }).then(function() {
    data.forEach(function(d){
      console.log(d);
    });
  }).then(function() {
    mongoose.disconnect();
  });
});

var exphbs = require('express-handlebars');
var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require('cors')
const favicon = require('serve-favicon');
const config = require("./config/config.json");
const secret = require("./config/config.secret.json");
const path = require('path')
const app = express();

app.use('/assets', express.static(__dirname + '/assets'))
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(favicon(path.join(__dirname,'assets','favicon.ico')));
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());



app.get('/', async (req, res) => {
  try {
    const uploads = await getUploads();
    res.render('index', {
      ENV_NAME: process.env.ENV_NAME,
      ENV_NAME_ENCRYPT: process.env.ENV_NAME_ENCRYPT,
      CONFIG_VERSION: config.APP_VERSION,
      CONFIG_ENCRYPT: secret.API_KEY,
      PLATFORMER_IMG_TAG: process.env.PLATFORMER_IMG_TAG,
      uploads: uploads
    });
  }
  catch (e) {
    console.error(e)
  }

});


async function getUploads() {
  return new Promise((resolve, reject) => {
    const arr = [];
    fs.readdir(__dirname + '/uploads/', function (err, items) {
      if (err) {
        resolve(arr)
        return;
      }
      if (!items) {
        resolve(arr)
        return;
      }
      for (var i = 0; i < items.length; i++) {
        arr.push({ url: `/uploads/${items[i]}`, name: items[i] });
      }
      resolve(arr);
    });
  });
}

app.post('/', function (req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req);

  form.on('fileBegin', function (name, file) {
    file.path = __dirname + '/uploads/' + file.name;
  });

  form.on('file', function (name, file) {
    console.log('Uploaded ' + file.name);
  });

  res.redirect('/');
});

app.post('/message', function (req, res) {

  fs.appendFile("./log/messages.log", "\n" + new Date() + " - " + req.body.msg, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The messages.log file was updated!");
  });
  res.redirect('/');
});
app.listen(8080, () => {
  console.log('demo started on 8080')
});

var express = require('express');
var router = express.Router();
var mysql = require('mysql');

const db_config = require('../api/db-config.json');
const connection = mysql.createConnection({
    host : db_config.host,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test/', function(req,res) {
  connection.query('SELECT * FROM foodoc.users', function(err,result) {
    console.log(JSON.stringify(result));
  })  
})
module.exports = router;

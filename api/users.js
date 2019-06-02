var express = require('express');
var router = express.Router();
var success= {result:'success'};
var fail = {result:'fail'};
var KakaoStrategy = require('passport-kakao').Strategy;

const mysql = require('mysql');
const db_config = require('./db-config.json')
const connection = mysql.createConnection({
    host : db_config.host,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database
});

connection.connect((err) => {
  if(!err){
      console.log('DB Connection Succeded!');
  } else{
      console.log('Failed! \n ERROR:' + JSON.stringify(err, undefined, 2));
  }
});

async function getDataFromDB(query){

  return new Promise((resolve, reject) => {
      try {
          connection.query(query, function(err, rows, fields) {
              resolve(rows); 
          });
      } catch (err) {
          reject(err);
      }
  });
  connection.end();
}

/* GET users listing. */
router.get('/', async(req, res, next) => {
  try{
      const donemeals = await getDataFromDB("SELECT * FROM foodoc.users ORDER BY uid asc");
      res.status(200).json(donemeals);
  } catch(err) {
      res.status(400).json({message: err.message});
      console.log(err);
}
});

/* GET a user */
router.get('/:uid', async(req, res, next) => {
  try{
     const donemeals = await getDataFromDB('SELECT * FROM foodoc.users WHERE uid = ' + req.params.uid);
      res.status(200).json(donemeals);
  } catch(err) {
      res.status(400).json({message: err.message});
      console.log(err);
}
});



// 회원가입

router.post('/join/',  function(req,res,next) {

  const data = req.body;
  
  var connect = connection.query("INSERT INTO `users` (name,email,password,gender,age,height,weight) VALUES('" + data.name + "','" + data.email + "','" + data.password + "','" + data.gender + "','" + data.age + "','" + data.height + "','" + data.weight + "')",
  function(error, rows){
      if(error){
          res.status(400).send('Error Occurred!');
          console.log(error);
      } else {
          res.status(200).redirect('/users/');
      }
  });
});

// Login 

router.post('/login/', function(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;

  connection.query('SELECT * FROM foodoc.users WHERE email = ?', [email], function(error, results, fields) {
      if(error){
          res.status(400).json({message: error.message});
      } else {
          if(results.length > 0) {
              if(results[0].password == password) {
                  console.log("login success");
                  res.status(200).json({message: "login success"});
              } else {
                  console.log("Email and password does not match");
                  res.status(204).json({message: "Wrong Password"});
              }
          } else {
              console.log("email does not exists");
              res.status(204).json({message: "Email Not Found"});
          }
      }
  })
});


/*  회원 정보 조회 */

router.post('/usersInfo', function(req,res,next) {
    
  var data = req.body['uid'];

  connection.query('SELECT name,email,gender,age,height,weight FROM foodoc.users WHERE uid = ?', data, function(err, result) {
      if(!err) {
          res.header("Content-Type", "application/json; charset=utf-8");
          res.send(result[0]);
      }else{
          res.header("Content-Type", "application/json; charset=utf-8");
          res.send(fail);
          console.log(err);
      }
  })
})

// Delete users info.
router.delete('/users/delete/:uid', async (req,res,next) => {
  try{
      const donemeals = connection.query('DELETE FROM foodoc.users WHERE uid = ' + req.params.uid);
      console.log("Data has deleted!");
      res.status(200).send('/users/');
   } catch(err) {
       res.status(400).json({message: err.message});
       console.log(err);
}    
});

module.exports = router;

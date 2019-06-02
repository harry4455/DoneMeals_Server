const express = require('express');
const router = express.Router();
const mysql = require('mysql');
//const multer = require('multer');
//var Q = require('Q');
const upload = require('./uploadMiddleware');
const Resize = require('./resize');
var path = require('path');

const db_config = require('./db-config.json');
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

// //파일 저장위치와 파일이름 설정
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         //파일이 이미지 파일이면
//         if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
//              console.log("이미지 파일이네요");
//              cb(null, '../uploads');
//             } 
//     },
//     //파일이름 설정
//     filename: function (req, file, cb) {
//         file.uploadedFile = {
//             name: req.params.filename,
//             ext: file.mimetype.split('/')[1]
//         };
//         cb(null, file.uploadedFile.name + "." + file.uploadedFile.ext);
//       }
// });

// var upload = multer({ storage: storage })



/* GET foodlist */
router.get('/', async(req, res, next) => {
    try{   
        const donemeals = await getDataFromDB("SELECT * FROM foodoc.food");
        res.status(200).json(donemeals)
    } catch(err) {
        res.status(400).json({message: err.message});
        console.log(err);
    }
});

/* upload image */

router.post('/upload', upload.single('image'), async function(req,res) {
    console.log("upload")
    const imagePath = path.join(__dirname, '/public/images');
    const fileUpload = new Resize(imagePath);
    if (!req.file) {
        res.status(401).json({error: 'please insert any image!'});
    }
    const filename = await fileUpload.save(req.file.buffer);
    return res.status(200).json({ name: filename });
});

/* 먹은 음식 입력 */
router.post('/insert/', function (req,res,next) {
    const data = req.body;
    
    var connect = connection.query("INSERT INTO `food` (uid,fid,meal,amount,InsertedDate,InsertedTime) VALUES('" + data.uid + "','" + data.fid + "','" + data.meal + "','" + data.amount + "','" + data.InsertedDate + "','" + data.InsertedTime + "')",
    function(error){
        if(error){
            res.status(400).send('Internal Server Error!');
            console.log(error);
        } else {
            res.status(200).redirect('/food/');
        }
    });
  });

/* uid로 food 조회 */
router.post('/Info/', function(req, res) {
    
    var data = req.body['uid'];
    
    connection.query("SELECT * FROM foodoc.food WHERE uid = ? ", data, function(err, result){
        if(!err){
            res.status(200).json(result);
        } else {
            res.status(400).json({message: err.message});
            console.log(err);
        }
    });
});

/* uid와 날짜로 먹은 음식 조회*/
router.post('/Info/:uid', async(req, res, next) => {
    var data = [req.body['uid'], req.body['InsertedDate']];
    
    connection.query("SELECT * FROM foodoc.food WHERE uid = ? && InsertedDate = ? ", data, function(err, result){
        if(!err){
            res.status(200).json(result);
        } else {
            res.status(400).json({message: err.message});
            console.log(err);
        }
    });
});

/* uid로 사용자 먹은음식 전체 삭제 */
router.post('/delete/', async (req,res) => {
    var data = req.body['uid'];

    try{
        const donemeals = connection.query('DELETE FROM foodoc.food WHERE uid = ?', data);
        console.log("Data has deleted!");
        res.status(200).send('/food/');
     } catch(err) {
         res.status(400).json({message: err.message});
         console.log(err);
 }    
});

/* Delete specific food of user */
router.post('/deleteFood/', function (req,res) {

    var data = [req.body['uid'], req.body['InsertedDate'], req.body['meal']];

    connection.query("DELETE FROM foodoc.food WHERE uid = ? and InsertedDate = ? and meal = ?", data, function(err, result){
        if(!err){
            console.log("Data has deleted!");
            res.status(200).json(result);
        } else {
            res.status(400).json({message: err.message});
            console.log(err);
        }
    });
});


/* 기록된 먹은음식 정보 수정 (먹은양) */
router.put('/update/', async (req,res,next) => {
    var data = [req.body['amount'], req.body['uid']];
    try{
        const donemeals = connection.query('UPDATE foodoc.food SET amount = ? WHERE uid = ?',data);
        console.log("Data has updated!");
        res.status(200).send('/food/');
     } catch(err) {
         res.status(400).json({message: err.message});
         console.log(err);
 }    
});

module.exports = router;
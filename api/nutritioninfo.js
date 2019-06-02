const express = require('express');
const router = express.Router();
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

//GET NutritionInfo list
router.get('/', async(req, res, next) => {
    try{   
        const donemeals = await getDataFromDB("SELECT * FROM foodoc.nutritionInfo");
        res.status(200).json(donemeals);
    } catch(err) {
        res.status(400).json({message: err.message});
        console.log(err);
}
});

/* fid로 NutritionInfo 조회 */
router.post('/search', async(req, res) => {
    
    var data = req.body['fid'];
    connection.query("SELECT fname,calories,protein,fat,sugars,sodium,cholesterol,saturatedFat,transFat FROM foodoc.nutritionInfo WHERE fid = ? ", data, function(err, result){
            if(!err){
                res.status(200).json(result);
            } else {
                res.status(400).json({message: err.message});
                console.log(err);
            }
        });
});

/* fname로 NutritionInfo 조회 */
router.post('/search/fname', async(req, res, next) => {
    
    var data = req.body['fname'];
    connection.query("SELECT calories,protein,fat,sugars,sodium,cholesterol,saturatedFat,transFat FROM foodoc.nutritionInfo WHERE fname = ? ", data, function(err, result){
            if(!err){
                res.status(200).json(result);
            } else {
                res.status(400).json({message: err.message});
                console.log(err);
            }
        });
});

module.exports = router;
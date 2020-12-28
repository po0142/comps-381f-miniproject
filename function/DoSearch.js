const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const formidable = require('express-formidable');
const mongourl = '';
const dbName = 'test';
const client = new MongoClient(mongourl);

app.set('view engine','ejs');
app.get('/result' ,(req,res) => {
    
    handle_search(res,req.query,req);
});



const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurants').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
	assert.equal(err,null);
	console.log(`findDocument: ${docs.length}`);
	callback(docs);
    });
}

const handle_search = (res,criteria ,req )=>{
    const client = new MongoClient(mongourl);
	    client.connect((err) => {
		assert.equal(null, err);
		console.log("Connected successfully to server");
        const db = client.db(dbName);
        const DOCID = {};

        if (criteria.name != "") {
            DOCID['name'] = criteria.name;
        } 

        if (criteria.cuisine != "") {
            DOCID['cuisine'] = criteria.cuisine;
        }
        
        if (criteria.borough != "") {
            DOCID['borough'] = criteria.borough;
        }
         
        findDocument(db, DOCID, (docs) => {
            client.close();
            console.log(criteria.name);
            console.log("Closed DB connection");
            res.status(200).render('search_result', {nRestaurants: docs.length, restaurants: docs});
        });
    });
};

module.exports = app;

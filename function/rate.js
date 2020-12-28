const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const formidable = require('express-formidable');
const mongourl = '';
const dbName = 'test';
const client = new MongoClient(mongourl);

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurants').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
	assert.equal(err,null);
	console.log(`findDocument: ${docs.length}`);
	callback(docs);
    });
}

app.get('/edit', (req,res) => {
    let DOCID = {};
    DOCID['_id'] = ObjectID(req.query._id);

    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null,err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
            client.close();
        
            if (req.session.username == docs[0].ower){
                handle_Edit(res, req.query);
            }else{
                res.status(200).render('infoE', {});
            }

        });
    });
})

app.get('/rating', (req,res) => {

    const addRate = (criteria, rate, callback) => {
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
    
            db.collection('restaurants').updateOne(criteria,
                {
                    $push: {rate: rate}
                },
                (err, results) => {
                    client.close();
                    assert.equal(null,err);
                    callback(results);
                }
            );
        });
    }
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);

    let DOCID = {};
    DOCID['_id'] = ObjectID(req.query._id);
    DOCID['rate.ower'] = req.session.username;

    var rate = {};
    rate['ower'] = req.query.ower;
    rate['score'] = req.query.score;


    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null,err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
            client.close();
            console.log(req.session.username);
        
            if (docs.length != 0){
                res.status(200).render('failedRate', {message: "Error. You have rated the restaurant."});
            }else{
                addRate(criteria, rate, (results) => {
                    res.status(200).render('infoC', {});
                });
            }

        });
        

    });

})


module.exports = app;

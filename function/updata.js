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
const fs = require('fs');


const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('restaurants').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Update = (req, res, criteria) => {

    var DOCID = {};
    DOCID['_id'] = ObjectID(req.fields._id);

    var updateDoc = {};
    updateDoc['name'] = req.fields.name;
    updateDoc['borough'] = req.fields.borough;
    updateDoc['cuisine'] = req.fields.cuisine;
    updateDoc['address'] = {"street": req.fields.street, "building": req.fields.building, "zipcode": req.fields.zipcode, "coord": [req.fields.lon, req.fields.lat]};
    if (req.files.sampleFile.size > 0) {
        fs.readFile(req.files.sampleFile.path, (err,data) => {
            assert.equal(err,null);
            updateDoc['sampleFile'] = new Buffer.from(data).toString('base64');
            updateDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('infoC', {})
            });
        });
    } else {
        updateDocument(DOCID, updateDoc, (results) => {
            res.status(200).render('infoC', {})
        });
    }
}

app.use('/change',formidable());

app.post('/change', (req,res) => {
	handle_Update(req, res, req.query);
})





module.exports = app;
    

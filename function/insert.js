const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const formidable = require('formidable');
const fs = require('fs');
 
const mongourl = '';
const dbName = 'test';
const client = new MongoClient(mongourl);




app.post('/create',(req,res) => {

    const form = new formidable.IncomingForm();
    
	form.parse(req, function(err, fields, files){

        let address =
            { "street"        : fields.street,
              "building"      : fields.building,                           
              "zipcode"       : fields.zipcode,
              "coord"         : [fields.lon, fields.lat]                           
            }
        
        let DOC = [
        { 
            "name"          : fields.name,
            "borough"       : fields.borough,
            "cuisine"       : fields.cuisine,
            "address"       : address,
            "sampleFile"    : files.sampleFile,
            "ower"          : req.session.username
            }
        ]
        
        const insertDocument = (db, doc, callback) => {
            db.collection('restaurants').
            insertMany(doc, (err, results) => {
                assert.equal(err,null);
                console.log(`Inserted document(s): ${results.insertedCount}`);
                callback();
            });
        }	
        
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
	   

            if (files.sampleFile.size > 0) {
                fs.readFile(files.sampleFile.path, (err,data) => {
                    assert.equal(err,null);
                    DOC[0].sampleFile = new Buffer.from(data).toString('base64');

		    console.log(`1:${JSON.stringify(DOC)}`);
		   // console.log(`2:${DOC['sampleFile']}`);
                    insertDocument(db, DOC, () => {
                        client.close();
                        console.log("Closed DB connection");		
                        res.status(200).render('infoC',{});
                    })
                });
            } else {
                insertDocument(db, DOC, () => {
                    client.close();
                    console.log("Closed DB connection");		
                    res.status(200).render('infoC',{});
                })
            }
        });
    });
});

module.exports = app;

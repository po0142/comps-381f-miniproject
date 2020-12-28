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


app.get('/remove', (req,res) => {

    handle_Delete(req,res,req.query);

});

const deleteDocument = (db, deleteDoc, callback) => {
    db.collection('restaurants').deleteOne(deleteDoc, (err,results) => {
        assert.equal(null, err);
        callback(results)
    });
}

const handle_Delete = (req, res, criteria) => {

    if (criteria.owner == req.session.username) {
        const client = new MongoClient(mongourl);
        console.log("delete");
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
    
            let DOCID = {}
            DOCID['_id'] = ObjectID(criteria._id);
            deleteDocument(db,DOCID,(results)=> {
                client.close();
                res.status(200).render('delete', {});
            });
        });

    } else {
          res.status(200).render('failedDelete',{});
    }
}

module.exports = app;
    

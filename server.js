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

const insertfunction = require('./function/insert');
const deletefunction = require('./function/delete');
const updatafunction = require('./function/updata');
const searchfunction = require('./function/DoSearch');
const ratefunction   = require('./function/rate');

app.set('view engine','ejs');
const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'student', password: ''},
	{name: 'demo', password: ''} 
);

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY]
}));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurants').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
	assert.equal(err,null);
	console.log(`findDocument: ${docs.length}`);
	callback(docs);
    });
}

const handle_Details = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
	assert.equal(null, err);
	console.log("Connected successfully to server");
	const db = client.db(dbName);
	
	/* use Document ID for query */
	let DOCID = {};
	DOCID['_id'] = ObjectID(criteria._id)
	findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
	    client.close();
	    console.log("Closed DB connection");
	    res.status(200).render('details',{restaurant:docs[0],id:DOCID['_id']});	

	    });
    });
}

app.get('/', (req,res) => {
	console.log(req.session);
	console.log(req.session.authenticated)
	if (!req.session.authenticated) {    // user not logged in!
		res.redirect('/login');
	} else {

	const handle_Find = (res, criteria) => {
	    const client = new MongoClient(mongourl);
	    client.connect((err) => {
		assert.equal(null, err);
		console.log("Connected successfully to server");
		const db = client.db(dbName);

		findDocument(db, criteria, (docs) => {
		    client.close();
		    console.log("Closed DB connection");
		    console.log(req.session.authenticated)
		    res.status(200).render('read',{name:req.session.username,nRestaurants:docs.length,restaurants:docs});
		});
	    });
	}
	handle_Find(res, req.query.docs);
	}
});

app.get('/login', (req,res) => {
	res.status(200).render('login',{});
});

app.get('/new', (req,res) => {
	res.status(200).render('new',{});
});

app.get('/details', (req,res) => {
    handle_Details(res, req.query);
})

app.post('/login', (req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {
			// correct user name + password
			// store the following name/value pairs in cookie session
			req.session.authenticated = true;        // 'authenticated': true
			req.session.username = req.body.name;	 // 'username': req.body.name		
		}
	});
	res.redirect('/');
});

app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});

app.get('/search', (req,res) => {
	res.status(200).render('search',{});
});

app.get('/rate', (req,res) => {
    res.status(200).render('rate',{user: req.session.username, restaurant: req.query._id});
})

const handle_Edit = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('restaurants').find(DOCID);
        cursor.toArray((err,docs) => {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{restaurant: docs[0]});
        });
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
                res.status(200).render('failedEdit', {});
            }

        });
    });
})

app.get("/gmap", (req,res) => {
	res.render("gmap", {
		lat:req.query.lat,
		lon:req.query.lon,
		zoom:req.query.zoom ? req.query.zoom : 50
	});
	res.end();
});

app.get('/BackInfoC', (req,res) =>{
     res.status(200).render('read',{});
});

app.get('/GoInfoC', (req,res) =>{
	res.status(200).render('read',{});
});

app.use(insertfunction);
app.use(deletefunction);
app.use(updatafunction);
app.use(searchfunction);
app.use(ratefunction);


app.get('/api/restaurant/name/:name', (req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing resturant name"});
    }
})
app.get('/api/restaurant/borough/:borough', (req,res) => {
    if (req.params.borough) {
        let criteria = {};
        criteria['borough'] = req.params.borough;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing bookingid"});
    }
})

app.get('/api/restaurant/cuisine/:cuisine', (req,res) => {
    console.log(req.body)
    if (req.params.cuisine) {
        let criteria = {};
        criteria['cuisine'] = req.params.cuisine;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing cuisine"});
    }
})

app.get('/*', (req,res) => {
    //res.status(404).send(`${req.path} - Unknown request!`);
    res.status(404).render('infoE', {message: `${req.path} - Unknown request!` });
})


app.listen(process.env.PORT || 8099);

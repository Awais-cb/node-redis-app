const express = require('express');
const expressHandleBars = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
const path = require('path');

// init express app
const app = express();

// app port
const port = 8080;

//creating redis client 
var redisClient=redis.createClient();
redisClient.on('connect', function() {
	console.log('Connected to redis!');
});

// setting up view engine
app.engine('handlebars',expressHandleBars({defaultLayout:'main'}));
app.set('view engine','handlebars');


// init bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


// init method override
app.use(methodOverride('_method'));

// render search users
app.get('/',function(req,res) {
	res.render('searchusers');
});

// process search users
app.post('/user/search',function(req,res,next) {
	let uid=req.body.uid;
	redisClient.hgetall(uid,function(err,obj) {
		if(!obj){
			
			res.render('searchusers',{
				error:"User does not exist!"
			});

		}else{
			// appending the object id into return user's object to view on rendered page
			obj.userid = uid;
			res.render('details',{
				user:obj
			});
		}
	});
});

// Render add user page
app.get('/user/add',function(req,res) {
	res.render('addusers');

});

// Process add user
app.post('/user/add',function(req,res,next) {
			let id = req.body.uid;
			let fname = req.body.fname;
			let lname = req.body.lname;
			let email = req.body.email;
			let phone = req.body.phone;

			redisClient.hmset(id , {
						'first_name':fname,
						'last_name':lname,
						'email':email,
						'phone':phone
						},function(err,response) {
					if(err){
						console.log(err);
					}
					console.log(response);
					if(response=='OK'){
						res.render('addusers',{
							success:'A user has been successfully added!'
						});
					}

				});
});

// Delete user
// we use :id when parsing a parameter from url
// using method delete using method overide which overriding post
app.delete('/user/delete/:id',function(req,res,next) {
	
	redisClient.del(req.params.id);
	
	res.render('searchusers',{
		del_success:'User with id '+req.params.id+' has been deleted'
	});
});

app.listen(port,function(argument) {
	console.log('server started at post '+port);
});
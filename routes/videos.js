
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var flash = require('connect-flash');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');


//models
var users = mongoose.model('users');
var videos = mongoose.model('videos');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*router.use(function(req, res, next) {
	if(!req.user) {
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
	else
  		next();
});*/


router.get('/watch/:id', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	videos.update({ '_id' : id}, {$inc : { views : 1 }}).exec();
	videos.findOne( { '_id' : id}).populate('users._userid').exec( function(err, video){
		console.log(video);
		var user = selectuser(video.users);
		console.log(user);
		var ip = user._userid.ip;
		var path = user.url;
		//console.log(path);
		//console.log('+++++++');
		var vidurl="http://"+ip+":8888/"+path;
		console.log(vidurl);
		if(req.user){
			//console.log(typeof id);console.log(id);
			var oid= mongoose.Types.ObjectId(id);console.log('4232332');
			//console.log(oid);console.log('4232332');
			users.findOne({	'_id': req.user._id,
				'upvoted': oid 
			}, function(err, id1){
				var up = false; var dn = false;
				console.log(id1);console.log('81390310933209');
				if(id1){
					up = true; 
				}
				else{
					up = false;
				}
				users.findOne({ '_id': req.user._id,
					'downvoted': oid 
				}, function(err, id1){
					console.log(id1);console.log('81390310933209');
					if(id1){
						dn = true; 
					}
					else{
						dn = false;
					}
					console.log(up);
					console.log(dn);
					res.render('users/watch', {up : up, dn :dn, error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user, vusrdata: user,videodata: video});
				});
			});	
		}
		else
			res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, vusrdata: user, videodata: video });
		//res.send(ip);	
	});
});

/*router.get('/watch', function(req, res, next) {
	//var val = req.query.id;
	//console.log(req.params.id);
	var id = req.params.id;
	videos.update({ '_id' : id}, {$inc : { views : 1 }}).exec();
	videos.findOne( { '_id' : id}).populate('users._userid').exec( function(err, video){
		//console.log(video);
		var user = selectuser(video.users);
		console.log(user);
		var ip = user._userid.ip;
		var path = user.url;
		//console.log(path);
		console.log('+++++++88888888');
		var vidurl="http://"+ip+":8888/"+path;
		//var vidurl = "http://localhost:8888/v1.mp4"
		console.log(vidurl);
		if(req.user)
			res.render('users/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user});
		else
			res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl});
		//res.send(ip);	
	});
});*/

router.get('/downvoted/:id/:toggle', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	var toggle = req.params.toggle;
	if(toggle ==0 ){
		users.update(
			{'_id' : req.user._id},{
	            $addToSet:{ 
	                'downvoted': id
	            } 
	        }, function(err, result){
                if(err){
                	console.log(err);
					req.flash('error', 'some internal error in upvoting process');
					res.redirect('/users/index');
                }
                else{
                	console.log(result);
	    			console.log('============');
                	if(result.nModified == 1){
	            		videos.update({ '_id' : id}, {$inc : { downvotes : 1 }}).exec();
	            	}
                	
                }
                //console.log("######");
                //console.log(result);
        });
	}
	else if(toggle == 1){
		users.update({
    		'_id': req.user._id},{
    			$pull: {
    				'downvoted': id
    			}
    		}, function( err, resultp){
	    			if(err){
	    				console.log(err);
	    				req.flash('error', 'some internal error in upvoting process');
	    				res.redirect('users/index');
	    			}
	    			else{
	    				console.log(resultp);
		    			console.log('=========++');
		            	if(resultp.nModified == 1){
		            		videos.update({ '_id' : id}, {$inc : { downvotes : -1 }}).exec();
		            	}
	    			}
	            }
	        );
	}
	res.send('downvoted');
});

router.get('/upvoted/:id/:toggle', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	var toggle = req.params.toggle;
	if(toggle ==0 ){
		users.update(
			{'_id' : req.user._id},{
	            $addToSet:{ 
	                'upvoted': id
	            } 
	        }, function(err, result){
                if(err){
                	console.log(err);
					req.flash('error', 'some internal error in upvoting process');
					res.redirect('/users/index');
                }
                else{
                	console.log(result);
	    			console.log('============');
                	if(result.nModified == 1){
	            		videos.update({ '_id' : id}, {$inc : { upvotes : 1 }}).exec();
	            	}
                	
                }
                //console.log("######");
                //console.log(result);
        });
	}
	else if(toggle == 1){
		users.update({
    		'_id': req.user._id},{
    			$pull: {
    				'upvoted': id
    			}
    		}, function( err, resultp){
	    			if(err){
	    				console.log(err);
	    				req.flash('error', 'some internal error in upvoting process');
	    				res.redirect('users/index');
	    			}
	    			else{
	    				console.log(resultp);
		    			console.log('=========++');
		            	if(resultp.nModified == 1){
		            		videos.update({ '_id' : id}, {$inc : { upvotes : -1 }}).exec();
		            	}
	    			}
	            }
	        );
	}
	res.send('upvoted');
});

/*router.get('/upvoted/:id', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	if(!req.user){

	}
	else{
		videos.findOne( { '_id' : id}, function(err, video){
			//console.log(video);
			users.update(
				{'_id' : req.user._id},{
		            $addToSet:{ 
		                'upvoted': id
		            } 
		        }, function(err, result){
	                if(err){
	                	console.log(err);
						req.flash('error', 'some internal error in upvoting process');
						res.redirect('/users/index');
	                }
	                else{
	                	users.update({
	                		'_id': req.user._id},{
	                			$pull: {
	                				'downvoted': id
	                			}
	                		}, function( err, resultp){
	                			if(err){
	                				console.log(err);
	                				req.flash('error', 'some internal error in upvoting process');
	                				res.redirect('users/index');
	                			}
	                			console.log(result);
	                			console.log(resultp);
	                			console.log('============');
	                			if(result.nModified == 1){
			                		videos.update({ '_id' : id}, {$inc : { upvotes : 1 }}).exec();
			                	}
			                	if(resultp.nModified == 1){
			                		videos.update({ '_id' : id}, {$inc : { downvotes : -1 }}).exec();
			                	}
	                	});
	                }
	                //console.log("######");
	                //console.log(result);
	        });	
		});
		res.send('upvoted');
	}
});*/

var selectuser = function(users){
	return users[0];
}

module.exports = router;

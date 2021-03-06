'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require ('../models/user');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var Follow = require ('../models/follow');
var Publication = require('../models/publication');

function home(req, res) {
	res.status(200).send({
		message:'Hola mundo desde NodeJS'
	});
}

function pruebas(req, res){
	res.status(200).send({
		message:'Acción de pruebas en el servidos NodeJS'
	});
}

//registro de usuarios
function saveUser(req, res){
	var params = req.body;
	var user = new User();

	if (params.name && params.surname &&
		params.nick && params.email && params.password) {

		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		//cotrolar usuarios duplicados
		User.find({ $or:[
			{nick: user.nick},
			{email: user.email.toLowerCase()}
			
		]}).exec((err, users) => {
			if(err) return res.status(500).send({message: 'Error en la petición de usuarios'})

			if(users && users.length >= 1){
				return res.status(200).send({message: 'El usuario que intentas ya está registrado'})
			}else{
				//cifrar password y guardar los datos
				bcrypt.hash(params.password, null, null, (err, hash) =>{
					user.password = hash;

					user.save((err, userStored) => {
						if(err) return res.status(500).send({message: 'Error al gusradar usuario'})
						
						if(userStored){
							res.status(200).send({user: userStored});

						}else{
							res.status(404).send({message: 'no se ha registrado el usuario'});
						}
					});
				});
			}	
		});


	}else{
		res.status(200).send({
			message: 'Debes llenar  todos campos'
		});
	}
}

//login
function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email},(err, user) =>{
    	if(err)  return res.status(200).send({message: 'Error en la petición'});

    	if(user){
    		bcrypt.compare(password, user.password, (err, check)=>{
    			if(check){

    				if (params.gettoken) {
    					//devolver token y devolverl el token
    					return res.status(200).send({
    						token: jwt.createToken(user)
    					});
    				}else{
	    				//devolver los datos
	    				user.password = undefined;
	    				return res.status(200).send({user});
    				}
    				
    			}else{
    				return res.status(404).send({message: 'El usuario no se ha podido identificar'});
    			}
    		});
    	}else{
    		return res.status(404).send({message: 'El usuario no se ha podido identificar!!'});
    	}
	});
}

//conseguir datos de un usuario
function getUser(req, res){
	var userId = req.params.id;

	User.findById(userId, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});

		if(!user) return res.status(404).send({message: 'El usuario no existe'});

		followThisUser(req.user.sub, userId).then((value) => {
			user.password = undefined;
			return res.status(200).send({
				user,
			    following: value.following,
			    followed: value.followed
				});
		
		});
			
	});
}


async function followThisUser(identity_user_id, user_id){
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
            .then((following) => {
                return following;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
            .then((followed) => {
                //console.log(followed);
                return followed;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch(e){
        console.log(e);
    }
}



//devolver un listado de los usuarios
function getUsers(req, res){
	var identity_user_id = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 5;

	User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
		if(err) return res.status(500).send({message: ' Error en la petición'});

		if(!users) return res.status(404).send({message: 'no hay usuarios disponibles'});

		followUsersIds(identity_user_id).then((value) =>{
			return res.status(200).send({
			users,
			users_following: value.following,
			users_follow_me: value.followed,
			total,
			pages: Math.ceil(total/itemsPerPage)
		});

		});
		
	});

}

async function followUsersIds (user_id){
	try{
		var following = await Follow.find({'user': user_id}).select({'_id':0, '__v':0, 'user':0}).exec().then((following) =>{
			return following;
		}).catch((err) =>{
			return handleerror(err);
		});

		var followed = await Follow.find({'followed': user_id}).select({'_id':0, '__v':0, 'followed':0}).exec().then((followed) =>{
			return followed;
		}).catch((err) =>{
			return handleerror(err);
		});

		//metodo de following
		var following_clean = [];

		following.forEach((follow) =>{
			following_clean.push(follow.followed);
		});

		//metodo de followed
		var followed_clean = [];

		followed.forEach((follow) =>{
			followed_clean.push(follow.user);
		});
		

		return {
			following: following_clean,
			followed: followed_clean
		}
	}catch(e){
		console.log(e);
	}
}

//contadores de follows
 function getCounters(req, res){
 	var userId = req.user.sub;

 	if(req.params.id){
 		getCountFollow(req.params.id).then((value)=>{
 		return res.status(200).send( {
 			following: value.following,
 			followed: value.followed,
 			publication: value.publication
 		});
 	});
 	}else{
 		getCountFollow(userId).then((value)=>{
 		return res.status(200).send( {
 			following: value.following,
 			followed: value.followed,
 			publication: value.publication
 		});
 	});

 	}
 	
 }

 async function getCountFollow(user_id){
 	try{
 		var following = await Follow.countDocuments({'user':user_id}).exec().then((following) =>{
 		return following;
	 	}).catch((err) =>{
	 		return handleError(err);
	 	});

		var followed = await Follow.countDocuments({'followed':user_id}).exec().then((followed) =>{
	 		return followed;
	 	}).catch((err) =>{
	 		return handleError(err);
	 	});

	 	var publication = await Publication.countDocuments({'user': user_id}).exec().then((publication) => {
	 		return publication;
	 	}).catch((err)=>{
	 		return handleError(err);
	 	});

	 	return{
	 		following : following,
	 		followed: followed,
	 		publication: publication
	 	}

 	}catch(e){
 		console.log(e);
 	}
 	

 }

//Edición de datos de usuario
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	//borrar la propieda password
	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({message: 'no tienes permiso para actualizar este user'});
	}

	User.find({ $or:[
				 {email: update.email},
				 {nick: update.nick}
		]}).exec((err, users)=>{
			 var user_isset = false;
			users.forEach((user) =>{
				if(user && user._id != userId)  user_isset = true;
		
			});
			
			if(user_isset) return res.status(500).send({message: 'los datos ya están en uso'});

			User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
				if(err) return res.status(500).send({message: ' Error en la petición'});

				if(!userUpdated) return res.status(404).send({message:'no se ha podido actulizar el user'});
				
				return res.status(200).send({user: userUpdated});
			});

		});

	
}

// Subir archivos de imagen/avatar de usuario
function uploadImage(req, res){
	var userId = req.params.id;

	

	if (req.files) {
		var file_path = req.files.image.path;
		//console.log(file_path);
		
		var file_split = file_path.split('\\');
		
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');

		var file_ext = ext_split[1];
		//console.log(file_ext);

		if(userId != req.user.sub){
		
		return removeFilesOfUploads(res, file_path, 'no tienes permiso para actualizar este user');
		
		}

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){
			//Actualizar documento de user logueado
			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) =>{

				if(err) return res.status(500).send({message: ' Error en la petición'});

				if(!userUpdated) return res.status(404).send({message:'no se ha podido actulizar el user'});
				
				return res.status(200).send({user: userUpdated});
			});
		}else{
			return removeFilesOfUploads(res, file_path, 'Extensión no valida');
		}

	}else {
		return res.status(200).send({message: 'No se ha subido imagenes'});
	}
}

function removeFilesOfUploads(res, file_path, message){
	fs.unlink(file_path, (err) => {
				return res.status(200).send({message: message});
			});
}

function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/'+image_file;

	fs.exists(path_file, (exists) =>{
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe la imagen..'});
		}
	});
}

module.exports = {
	home,
	pruebas,
	saveUser, 
	loginUser,
	getUser, 
	getUsers,
	updateUser,
	uploadImage,
	getImageFile, 
	getCounters
}
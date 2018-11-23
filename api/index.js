'use strict'

var mongoose = require('mongoose');
var app = require("./app");
var port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/curso_mean_social", { useNewUrlParser: true }) //con esto nos conectamos y colocamos que el usuarios es cliente
				.then(()=>{
					console.log("Hola..la conexión a la base de datos curso_mean_social he sido un éxito");
					
					//crear servidor
					app.listen(port, () =>{
						console.log("servidor corriendo http://localhost:3800");
					});

				})
				.catch(err => console.log("err"));

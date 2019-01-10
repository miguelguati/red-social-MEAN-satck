import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';


@Component({
	selector: "login",
	templateUrl: './login.component.html',
	providers: [UserService]
})

export class LoginComponent implements OnInit {
	
	public title : String;
	public user: User;
	public status : String;
	public identity;
	public token;
	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Ingresar';
		this.user = new User("","","","","","","ROLE_USER","");
	}

	ngOnInit(){
		console.log('componente de login cargado');
	}

	onSubmit(){
		this._userService.singup(this.user).subscribe(
				response =>{
					this.identity = response.user;
					if (!this.identity || !this.identity._id) {
						this.status = 'error';
					}else{
						
						//persisitr los datos ddel usuario
						localStorage.setItem('identity', JSON.stringify(this.identity));

						//conseguir el token
						this.getToken();
					}
					
					
				},
				error =>{
					var errorMessage = <any>error;
					if(errorMessage != null){
						this.status = 'error';
					}
				}
			);
	}

	getToken(){
		this._userService.singup(this.user, 'true').subscribe(
				response =>{
					this.token = response.token;
					if (this.token.length <= 0) {
						this.status = 'error';
					}else{
						
						console.log(this.token);
						//persistir el token del usuario
						localStorage.setItem('token', JSON.stringify(this.token));

						//para redirigir una vez iniciemos sesión
						this.getCounters();
						
					}
					
					
				},
				error =>{
					var errorMessage = <any>error;
					if(errorMessage != null){
						this.status = 'error';
					}
				}
			);
	}

	getCounters(){
		this._userService.getCounters().subscribe(
			response => {
				localStorage.setItem('stats', JSON.stringify(response));
				this.status = 'success';
				this._router.navigate(['/']);
			},
			error =>{
				console.log(<any>error);
			}
		);
	}


}
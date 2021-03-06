import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
@Component({
	selector: "register",
	templateUrl: './register.component.html',
	providers: [UserService]
})

export class RegisterComponent implements OnInit {
	
	public title : String;
	public user: User;
	public status: String;
	
	constructor(

		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Registro';
		this.user = new User("",
			"",
			"",
			"",
			"",
			"",
			"ROLE_USER",
			""); 
	}

	ngOnInit(){
		console.log('componente de registro cargado');
	}

	onSubmit(registerForm){
		//console.log(this.user);
		this._userService.register(this.user).subscribe(
				response =>{
					if(response.user && response.user._id){
						
						this.status = 'success';
						registerForm.reset();
					}else{
						this.status='error';
					}
				},
				error =>{
					console.log(<any>error);
				}
			);
	}
}
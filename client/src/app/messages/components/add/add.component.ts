import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { Message } from '../../../models/message';
import { Follow } from '../../../models/follow';
import { User } from '../../../models/user';
import { MessageService } from '../../../services/messages.services';
import { GLOBAL } from '../../../services/global';
import { UserService } from '../../../services/user.service';
import { FollowService} from '../../../services/follow.service';


@Component({
	selector: 'add',
	templateUrl: './add.component.html',
	providers:[FollowService, MessageService, UserService]
})

export class AddComponent implements OnInit{

	public title: string;
	public message: Message;
	public identity;
	public token;
	public url: string;
	public status: string;
	public follows;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _followService: FollowService,
		private _messageService : MessageService,
		private _userService : UserService
		){
		this.title = 'Enviar Mensajes';
		this.identity = _userService.getIdentity();
		this.message = new Message("", "", "", "", this.identity._id, "");
		this.token = _userService.getToken();
		this.url = GLOBAL.url;
	}

	ngOnInit(){
		//console.log(' add cargado');
		this.getMyFollows();
	}
	onSubmit(form){
		//console.log(this.message);
		this._messageService.addMessage(this.token, this.message).subscribe(
			response=>{
				if(response.message){
					this.status = 'success';
					form.reset();
				}
			},
			error=>{
				console.log(<any>error);
				this.status = 'error';
			}
			)
	}

	getMyFollows(){
		this._followService.getMyFollows(this.token).subscribe(
			response=>{
				this.follows = response.follows;
				//console.log(this.follows);
			},
			error=>{
				console.log(<any>error);
			}
			)
	}
}
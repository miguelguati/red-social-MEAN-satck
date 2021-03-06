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
	selector: 'received',
	templateUrl: './received.component.html',
	providers:[FollowService, MessageService, UserService]
})

export class ReceivedComponent implements OnInit{

	public title: string;
	public messages;
	public identity;
	public token;
	public url: string;
	public status: string;
	public follows;
	public page = 1;
	public pages;
	public total;
	public next_page;
	public prev_page;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _followService: FollowService,
		private _messageService : MessageService,
		private _userService : UserService
		){
		this.title = ' Mensajes Recibidos ';
		this.identity = _userService.getIdentity();
		this.messages;
		this.token = _userService.getToken();
		this.url = GLOBAL.url;
	}

	ngOnInit(){
		//console.log(' sended cargado');
		this.actualPage();

	}
	actualPage(){
		this._route.params.subscribe(params =>{

			
			
			let page = +params['page'];
			this.page = page;

			if(!params['page']){
				page = 1;
			}

			if(!page){
				page = 1;
			}else{
				this.next_page = page+1;
				this.prev_page = page-1;

				if (this.prev_page <=0) {
					this.prev_page = 1;
				}
			}

			//devolver listado de usuarios
			this.getMessages(this.token, this.page);

		});
	}

	getMessages(token, page){
		this._messageService.getMyMessages(token, page).subscribe(
			response=>{
				if(response){
					
					this.messages = response.messages;
					this.pages = response.pages;
					this.total = response.total;
					//console.log(this.messages);
				}
			},
			error=>{
				console.log(<any>error);
			}
			);
	}
}
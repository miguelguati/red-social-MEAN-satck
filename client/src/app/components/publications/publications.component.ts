import { Component, OnInit, Input} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import {PublicationService} from '../../services/publication.service';
import * as $ from 'jquery';

@Component({
	selector: 'publications',
	templateUrl: './publications.component.html',
	providers: [UserService, PublicationService]
})

export class PublicationsComponent implements OnInit{
	public identity;
	public token;
	public title: string;
	public url: string;
	public status: string;
	public page = 1;
	public total;
	public pages;
	public itemsPerPage;
	public publications: Publication[];

	@Input() user : string;

	constructor(
		private _rotue: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _publicationService: PublicationService
		){

		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.title = 'Publicaciones';
		this.url = GLOBAL.url;
	}

	ngOnInit(){
		//console.log("se cargo el component publications");
		this.getPublications(this.user, this.page);
	}	

	getPublications(user, page, adding= false){
		this._publicationService.getPublicationsUser(this.token, user,  page).subscribe(
			response=>{
				
				if(response.publications){
					//console.log(response.publications);
					
					this.status = 'success';
					this.total = response.total_items;
					this.pages = response.pages;
					this.itemsPerPage = response.items_per_page;

					if(!adding){
						this.publications = response.publications;
					}else{
						var arrayA = this.publications;
						var arrayB = response.publications;
						this.publications = arrayA.concat(arrayB);

						$("html, body").animate({ scrollTop: $('html').prop("scrollHeight")}, 500);
					}

					if(page > this.pages){
						this._router.navigate(['/home']);
					}

				}else{
					this.status = 'error';
				}
			},
			error=>{
				var errorMessage = <any>error;
				console.log(errorMessage);
				if(errorMessage != null){
					this.status = 'error';
				}
			}
		);
	}
	public noMore = false;
	viewMore(){
		//console.log(this.publications.length);
		//console.log(this.total);
		this.page += 1;
		if (this.page  == this.pages ) {
			this.noMore = true;
		}

		this.getPublications(this.user, this.page, true);
	}


}
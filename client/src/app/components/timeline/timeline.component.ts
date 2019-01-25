import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import {PublicationService} from '../../services/publication.service';
import * as $ from 'jquery';

@Component({
	selector: 'timeline',
	templateUrl: './timeline.component.html',
	providers: [UserService, PublicationService]
})

export class TimelineComponent implements OnInit{
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

	constructor(
		private _rotue: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _publicationService: PublicationService
		){

		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.title = 'Timeline';
		this.url = GLOBAL.url;
	}

	ngOnInit(){
		//console.log("se cargo el component publications");
		this.getPublications(this.page);
	}	

	getPublications(page, adding= false){
		this._publicationService.getPublications(this.token, page).subscribe(
			response=>{
				
				if(response.publications){
					//console.log(response);
					
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

		this.getPublications(this.page, true);
	}

	refresh(event = null){
		//console.log('se lanzo el refresh');
		this.getPublications(1);
	}

	deletePublication(id){
		this._publicationService.deletePublication(this.token, id).subscribe(
			response =>{
				this.refresh();
			},
			error=>{
				var errorMessage = <any>error;
				console.log(errorMessage);
			}
			);
	}

}
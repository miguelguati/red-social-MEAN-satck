import { Component, OnInit} from '@angular/core';

@Component({
	selector: 'home',
	templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit{
	public title: String;

	constructor(){
		this.title = 'Bienvenido a NGsocial'
	}

	ngOnInit(){
		//console.log('home.component cargado');
	}
}
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';

//Rutas
import { MessagesRoutingModule } from './messages-routing.module';

//components
import { MainComponent } from './components/main/main.component';
import { ReceivedComponent } from './components/received/received.component';
import { SendedComponent } from './components/sended/sended.component';
import { AddComponent } from './components/add/add.component';

//services
import { UserService } from '../services/user.service';
import { UserGuard} from '../services/user.guard';

@NgModule({
  declarations: [
    MainComponent,
    ReceivedComponent,
    SendedComponent,
    AddComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MessagesRoutingModule,
    MomentModule
    
  ],
  exports:[
 	MainComponent,
    ReceivedComponent,
    SendedComponent,
    AddComponent
  ],
  providers: [
    UserService,
    UserGuard
  ],
  bootstrap: [MainComponent]
})
export class MessagesModule { }
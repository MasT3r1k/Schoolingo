import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// boneyard-js: auto-registers all captured skeleton bones
import './bones/registry';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from "@sentry/angular";

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


// boneyard-js: auto-registers all captured skeleton bones
import './bones/registry';

Sentry.init({
  dsn: "https://2a60881effaa93b3494aac8084c7cc91@o4511418028392448.ingest.de.sentry.io/4511418032783440",
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }), // console.log, console.warn and console.error
  ],
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

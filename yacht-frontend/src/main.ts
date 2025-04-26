import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';
import {authInterceptor} from './app/services/authInterceptor/auth.interceptor';
import {provideToastr, ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {importProvidersFrom} from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import {NgxStripeModule, provideNgxStripe} from 'ngx-stripe';
import {GoogleMapsModule} from '@angular/google-maps';

bootstrapApplication(AppComponent, {
  providers: [
    BrowserAnimationsModule,
    provideRouter(routes),
    provideHttpClient(withFetch() ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNgxStripe('pk_test_51QhsftIvZLQyTs3vjqctYGy3jrBGqFMmr2rfy4mvGBsPHFz3dMr47XGj8b1dbc3F3eqRT5o8mfMg7oRGbc35cxU100K1SZw6xl') ,
    NgxStripeModule,
    FormsModule,
    FullCalendarModule,
    GoogleMapsModule,
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 5000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
      })
    ),
  ],
})
  .catch((err) => console.error(err));

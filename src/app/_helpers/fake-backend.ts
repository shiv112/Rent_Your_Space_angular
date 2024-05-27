import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpEvent, HttpHandler, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

//array in localstorage for users
let users = JSON.parse(localStorage.getItem('users')) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor{

  intercept(request:HttpRequest<any>, next:HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    //wrap in server delayed api call
    return of(null)
    .pipe(mergeMap(handleRoute))
    .pipe(materialize())
    .pipe(delay(500))
    .pipe(dematerialize());

    function handleRoute(){
      switch(true){
        case url.endsWith('/users/register') && method === 'POST':
        return register();
        default:
        return next.handle(request);
      }
    }

    function register(){
        alert("register");
      const user = body;
      if(users.find(x => x.username === user.username )){
        return error('Username "'+user.username+'" is already taken');
      }

      user.id = users.length ? Math.max(...users.map(x => x.id)) +1:1;
      users.push(user);
      localStorage.setItem('users',JSON.stringify(users));
      return ok();
    }
    function ok(body?){
      return of(new HttpResponse({status:200, body}))
    }

    function error(message){
      return throwError({ error: { message }});
    }

  }
}

export const fakeBackendProvider = {
  //use fake backend instead of http backend service
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
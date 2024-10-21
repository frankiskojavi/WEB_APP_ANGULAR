import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuAppService {

  private apiUrl = `${environment.ApiUrlBase}/SeguridadAPP/ConsultarOpcionesMenuWebApp`;  
  constructor(private http: HttpClient) { }

  getMenuOptions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

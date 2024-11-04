import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { OpcionesMenu } from '../components/Shared/modelosPublicos/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuAppService {

  private apiUrl = `${environment.ApiUrlBase}/SeguridadAPP/ConsultarOpcionesMenuWebApp`;  
  private selectedMenuOption = new BehaviorSubject<OpcionesMenu | null>(null);
  selectedMenuOption$ = this.selectedMenuOption.asObservable();
  
  constructor(private http: HttpClient) { }

  getMenuOptions(): Observable<any[]> {
    return this.http.get<OpcionesMenu[]>(this.apiUrl);
  }

  registrarOpcionSeleccioanda(menuOption: OpcionesMenu): void {
    this.selectedMenuOption.next(menuOption);
  }

}

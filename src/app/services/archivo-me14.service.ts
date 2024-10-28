import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { map, Observable, of } from 'rxjs';

export interface DTO_IVE14EFResponse {
  cantidadRegistrosOK: number;
  cantidadRegistrosError: number;
  archivoTXT: string; // Contenido en base64 del archivo de texto
}

@Injectable({
  providedIn: 'root'
})
export class ArchivoME14Service {
  private apiUrl = `${environment.ApiUrlBase}/ArchivoEF14/GenerarArchivoIVE14EF`;
  constructor(private http: HttpClient) { }

  // Obtener los meses disponibles
  getMeses(): Observable<any[]> {
    const meses = [
      { value: 1, text: 'Enero' },
      { value: 2, text: 'Febrero' },
      { value: 3, text: 'Marzo' },
      { value: 4, text: 'Abril' },
      { value: 5, text: 'Mayo' },
      { value: 6, text: 'Junio' },
      { value: 7, text: 'Julio' },
      { value: 8, text: 'Agosto' },
      { value: 9, text: 'Septiembre' },
      { value: 10, text: 'Octubre' },
      { value: 11, text: 'Noviembre' },
      { value: 12, text: 'Diciembre' }
    ];
    return of(meses); 
  }

  // Obtener los años disponibles
  getAnos(): Observable<number[]> {
    const currentYear = new Date().getFullYear();  // Obtiene el año actual
    const anos = [];
  
    for (let year = 2000; year <= currentYear; year++) {
      anos.push(year);  // Añade cada año al arreglo
    }
  
    return of(anos);  // Retorna el Observable con el arreglo de años
  }
  
  // Generar el archivo   
  GenerarArchivoIVE14EF(fechaInicial: number, fechaFinal: number): Observable<{ archivoBlob: Blob, cantidadRegistrosOK: number, cantidadRegistrosError: number }> {
    const url = `${this.apiUrl}?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`;

    return this.http.get<DTO_IVE14EFResponse>(url).pipe(
      map(response => {
        // Convertir el archivo base64 en blob
        const archivoBlob = new Blob([new Uint8Array(atob(response.archivoTXT).split("").map(char => char.charCodeAt(0)))], { type: 'text/plain' });
        
        return {
          archivoBlob,
          cantidadRegistrosOK: response.cantidadRegistrosOK,
          cantidadRegistrosError: response.cantidadRegistrosError
        };
      })
    );
  }    
}

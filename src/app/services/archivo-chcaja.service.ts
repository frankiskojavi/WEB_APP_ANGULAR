import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of, map } from 'rxjs';

export interface DTO_CHCAJAVResponse {
  registrosOKEncabezado: number;
  registrosErrorEncabezado: number;
  registrosOKDetalle: number; 
  registrosERRORDetalle: number; 
  cantidadNit: number; 
  archivoTXTErrores: string; 
  archivoTXTOk: string; // Contenido en base64 del archivo de texto
}

@Injectable({
  providedIn: 'root'
})

export class ArchivoChcajaService {
  private apiUrl = `${environment.ApiUrlBase}/ArchivoCH/GenerarArchivoTemporal`;
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
      anos.push(year);
    }
  
    return of(anos);
  }
  
  // Generar el archivo   
  GeneracionArchivoCHCaja(fechaInicial: number, 
                          fechaFinal: number): 
                          Observable<{ archivoBlob: Blob, 
                                       registrosOKEncabezado: number, 
                                       registrosERROREncabezado: number,
                                       registrosOKDetalle : number,
                                       registrosERRORDetalle : number,
                                       cantidadNit: number
                                     }> {
    const url = `${this.apiUrl}?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`;

    return this.http.get<DTO_CHCAJAVResponse>(url).pipe(
      map(response => {
        // Convertir el archivo base64 en blob
        const archivoBlob = new Blob([new Uint8Array(atob(response.archivoTXTOk).split("").map(char => char.charCodeAt(0)))], { type: 'text/plain' });
        
        return {
          archivoBlob,
          registrosOKEncabezado: response.registrosOKEncabezado,
          registrosERROREncabezado: response.registrosErrorEncabezado,
          registrosOKDetalle: response.registrosOKDetalle,
          registrosERRORDetalle: response.registrosERRORDetalle,
          cantidadNit: response.cantidadNit
        };
      })
    );
  }      
}

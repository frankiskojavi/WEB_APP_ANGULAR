import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchivoME13Service {
  
  private apiUrl = `${environment.ApiUrlBase}/ArchivoME13/ConsultarInformacionArchivoIVE13MEPorFecha`;
  
  constructor(private http: HttpClient) {}

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
  generarArchivo(formData: any, nombreArchivoGenerar: string, fechaInicial: number, fechaFinal: number): Observable<any> {
    return this.GetApiConsultarInformacionArchivo(fechaInicial, fechaFinal).pipe(      
      map(data => {        
        const registrosProcesados = data.length;
        const contenidoArchivo = this.obtenerArchivo(data);
  
        return {
          success: true,
          registrosProcesados: registrosProcesados,
          registrosConError: 0,
          fileName: nombreArchivoGenerar,
          fileContent: contenidoArchivo
        };
      })
    );
  }

  private obtenerArchivo(data: any[]): string {
    const formattedData = data.map((item, index) => {
      return this.formatearInformacion(            
        item.lineaId,
        item.fecha,
        item.transaccion,
        item.tipo_Moneda,
        item.montoMO,
        item.montoUSD,
        item.cantidad_Trx,
        item.agenciaid
      );
    }).join('\n');  // Unir todas las líneas por salto de línea    
    return btoa(formattedData);
  }

  // Método para consumir la API y obtener la información
  // Método para consumir la API y obtener la información
  GetApiConsultarInformacionArchivo(fechaInicial: number, fechaFinal: number): Observable<any[]> {
    const url = `${this.apiUrl}?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`;

    return this.http.get<any[]>(url).pipe(
      map(response => {
        // Si la respuesta no es un arreglo, intentar convertirla a JSON
        if (typeof response === 'string') {
          try {
            response = JSON.parse(response);
          } catch (error) {
            throw new Error("La respuesta no pudo ser parseada como JSON.");
          }
        }
        
        if (!Array.isArray(response)) {
          throw new Error("La respuesta de la API no es un arreglo de datos.");
        }

        return response;
      })
    );
  }


  private formatearInformacion(lineaId: number, fecha: number, transaccion: string, tipoMoneda: string, montoMO: number, montoUSD: number, cantidadTrx: number, agenciaId: number): string {
    return this.formatearCadena(lineaId.toString(), 16) +  // ID de la línea, alineado a la izquierda (16 caracteres)
           `&&${fecha}` +  // Fecha
           `&&${transaccion}` +  // Tipo de transacción
           `&&${tipoMoneda}` +  // Tipo de moneda
           `&&${this.formatearCadena(this.formatMonto(montoMO), 15, ' ', true)}` +
           `&&${this.formatearCadena(this.formatMonto(montoUSD), 15, ' ', true)}` + 
           `&&${this.formatearCadena(cantidadTrx.toString(), 10, ' ', true)}` + 
           `&&${this.formatearCadena(agenciaId.toString(), 10, ' ', true)}`;
  }


  private formatearCadena(input: string, totalWidth: number, paddingChar: string = ' ', padLeft: boolean = false): string {
    if (padLeft) {
      return input.padStart(totalWidth, paddingChar);
    } else {
      return input.padEnd(totalWidth, paddingChar);
    }
  }
  
  private formatMonto(monto: number): string {
    return monto.toFixed(2);
  }


}

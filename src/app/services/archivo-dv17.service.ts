import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArchivoDV17Service {
  private apiUrl = `${environment.ApiUrlBase}/ArchivoDV17/ConsultarInformacionArchivoIVE17DVPorFecha`;
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
        item.fecha,
        item.tipoTransaccion,
        item.tipoPersona,
        item.tipoIdentificacion,
        item.noOrden,
        item.noIdentificacion,
        item.muniEmiCedula,
        item.apellido1,
        item.apellido2,
        item.apellidoCasada,
        item.nombre1,
        item.nombre2,
        item.nombreEmpresa,
        item.fNacimiento,
        item.paisPersona,
        item.actividadEco,
        item.detalle,
        item.zona,
        item.depto,
        item.municipio,
        item.origenFondos,
        item.tipoMoneda,
        item.montoOriginal,
        item.montoD,
        item.agencia,
        item.usuario,
        item.asiento,
        item.documento,
        item.codCliente,
        item.nombreCliente,
        item.descripcionTrn,
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

  private formatearInformacion(
    Fecha: string, 
    TipoTransaccion: string, 
    TipoPersona: string, 
    TipoIdentificacion: string, 
    NoOrden: string, 
    NoIdentificacion: string, 
    MuniEmiCedula: string, 
    Apellido1: string, 
    Apellido2: string, 
    ApellidoCasada: string, 
    Nombre1: string, 
    Nombre2: string, 
    NombreEmpresa: string, 
    FNacimiento: string, 
    PaisPersona: string, 
    ActividadEco: string, 
    Detalle: string, 
    Zona: string, 
    Depto: string, 
    Municipio: string, 
    OrigenFondos: string, 
    TipoMoneda: string, 
    MontoOriginal: string, 
    MontoD: string, 
    Agencia: string, 
    USUARIO: string, 
    ASIENTO: string, 
    DOCUMENTO: string, 
    COD_CLIENTE: number, 
    NOMBRECLIENTE: string, 
    DESCRIPCIONTRN: string
): string {
    // Remover tildes y caracteres especiales
    const quitarTildes = (texto: string): string => {
        return texto.trim() // Aplicar trim en cada campo
            .replace(/[Áá]/g, 'A')
            .replace(/[Éé]/g, 'E')
            .replace(/[Íí]/g, 'I')
            .replace(/[Óó]/g, 'O')
            .replace(/[Úú]/g, 'U')
            .replace(/[-\/$&]/g, ' ');
    };

    // Formateo de strings con longitud fija
    const formatearCadena = (cadena: string, longitud: number, relleno: string, alinearDerecha: boolean): string => {
        cadena = quitarTildes(cadena.trim());
        if (cadena.length >= longitud) {
            return cadena.substring(0, longitud);
        }
        return alinearDerecha 
            ? cadena.padEnd(longitud, relleno) 
            : cadena.padStart(longitud, relleno);
    };

    // Formateo de montos multiplicados por 100
    const formatearMonto = (monto: string): string => {
        const montoTransformado = Math.trunc(parseFloat(monto.trim()) * 100);
        return montoTransformado.toString();
    };

    // Ajuste de NoOrden
    const ajustarNoOrden = (orden: string): string => {
        orden = quitarTildes(orden.trim());
        if (orden !== "J10" && orden !== "S20") {
            orden = orden.replace(/^0+/, '');
        }
        return orden;
    };

    // Concatenación de todos los campos formateados
    return `${formatearCadena(Fecha.trim(), 8, ' ', true).trim()}` +  
           `&&${formatearCadena(TipoTransaccion.trim(), 3, ' ', true).trim()}` + 
           `&&${formatearCadena(TipoPersona.trim(), 1, ' ', true).trim()}` + 
           `&&${formatearCadena(TipoIdentificacion.trim(), 1, ' ', true).trim()}` +
           `&&${ajustarNoOrden(NoOrden.trim()).trim()}` +
           `&&${formatearCadena(NoIdentificacion.trim(), 20, ' ', true).trim()}` +
           `&&${formatearCadena(MuniEmiCedula.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(Apellido1.trim(), 15, ' ', true).trim()}` +
           `&&${formatearCadena(Apellido2.trim(), 15, ' ', true).trim()}` +
           `&&${formatearCadena(ApellidoCasada.trim(), 15, ' ', true).trim()}` +
           `&&${formatearCadena(Nombre1.trim(), 15, ' ', true).trim()}` +
           `&&${formatearCadena(Nombre2.trim(), 30, ' ', true).trim()}` +
           `&&${formatearCadena(NombreEmpresa.trim(), 150, ' ', true).trim()}` +
           `&&${formatearCadena(FNacimiento.trim(), 8, ' ', true).trim()}` +
           `&&${formatearCadena(PaisPersona.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(ActividadEco.trim(), 3, ' ', true).trim()}` +
           `&&${formatearCadena(Detalle.trim(), 150, ' ', true).trim()}` +
           `&&${formatearCadena(Zona.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(Depto.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(Municipio.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(OrigenFondos.trim(), 2, ' ', true).trim()}` +
           `&&${formatearCadena(TipoMoneda.trim(), 3, ' ', true).trim()}` +
           `&&${formatearCadena(MontoOriginal.trim(), 14, ' ', true).trim()}` +
           `&&${formatearCadena(MontoD.trim(), 14, ' ', true).trim()}` +
           `&&${formatearCadena(Agencia.trim(), 10, ' ', true).trim()}` + 
           `&&`;
}

  
}

import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObjetoService {

  // 🔴 HARDCODED PARA APRESENTAÇÃO
  // Use 'http://10.0.2.2:8000' se for rodar no EMULADOR Android
  // Use 'http://127.0.0.1:8000' se for rodar no NAVEGADOR
  private readonly API_URL = 'http://127.0.0.1:8000/objetos/api/';

  constructor() { }

  // GET: Busca a lista
  async listar() {
    const options: HttpOptions = {
      url: this.API_URL,
      headers: { 'Content-Type': 'application/json' }
    };
    return CapacitorHttp.get(options);
  }

  // POST: Envia novo objeto (Crítica 4 - Interatividade)
  async cadastrar(dados: FormData) {
      const options: HttpOptions = {
        url: this.API_URL + 'criar/',
        
        // O navegador/Capacitor define o boundary multipart automaticamente.
        data: dados
      };
      return CapacitorHttp.post(options);
    }

  // DELETE: Remove objeto
  async remover(id: number) {
      const options: HttpOptions = {
      url: `${this.API_URL}${id}/`,
      headers: { 'Content-Type': 'application/json' }
    };
    return CapacitorHttp.delete(options);
  }
}
import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';

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
  async cadastrar(descricao: string, local: string, estado: string) {
    const corpo = {
      descricao: descricao,
      local: local,
      estado: estado,
      data_encontro: new Date().toISOString().split('T')[0] // Data de hoje YYYY-MM-DD
    };

    const options: HttpOptions = {
      url: this.API_URL,
      headers: { 'Content-Type': 'application/json' },
      data: corpo
    };

    return CapacitorHttp.post(options);
  }
  
  // DELETE: Remove objeto
  async remover(id: number) {
      const options: HttpOptions = {
      url: `${this.API_URL}${id}/`, // Concatena ID na URL hardcoded
      headers: { 'Content-Type': 'application/json' }
    };
    return CapacitorHttp.delete(options);
  }
}
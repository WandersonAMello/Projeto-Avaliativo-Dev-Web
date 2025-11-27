import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObjetoService {

  // URL base: http://10.0.2.2:8000/objetos/api/
  private readonly API_URL = environment.apiUrl + '/objetos/api/';
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Helper para pegar o Token
  private async getToken() {
    return await this._storage?.get('token');
  }

  // --- LEITURA ---
  async listar() {
    const token = await this.getToken();
    return CapacitorHttp.get({
      url: this.API_URL,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
  }

  async listarMeus() {
    const token = await this.getToken();
    return CapacitorHttp.get({
      url: `${this.API_URL}meus-itens/`,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
  }

  // --- ESCRITA (CRÍTICO PARA FOTOS) ---

  // 1. Cadastrar (POST) - Aceita FormData com Foto
  async cadastrar(dados: any) {
    const token = await this.getToken();
    
    // NOTA: Ao enviar FormData, NÃO definimos 'Content-Type'. 
    // O navegador/Capacitor faz isso sozinho para incluir o 'boundary' do arquivo.
    return CapacitorHttp.post({
      url: `${this.API_URL}criar/`,
      headers: {
        'Authorization': `Token ${token}`
      },
      data: dados
    });
  }

  // 2. Editar (PATCH) - Atualizado para aceitar Foto também
  async editar(id: number, dados: any) {
    const token = await this.getToken();
    const headers: any = {
      'Authorization': `Token ${token}`
    };

    // Lógica Inteligente:
    // Se NÃO for FormData (ou seja, é um objeto JS comum), convertemos para JSON
    // Se FOR FormData (tem foto), deixamos como está para o envio correto
    let dataToSend = dados;

    if (!(dados instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      dataToSend = JSON.stringify(dados);
    }

    return CapacitorHttp.patch({
      url: `${this.API_URL}editar/${id}/`,
      headers: headers,
      data: dataToSend
    });
  }

  async remover(id: number) {
    const token = await this.getToken();
    return CapacitorHttp.delete({
      url: `${this.API_URL}deletar/${id}/`,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
  }
}
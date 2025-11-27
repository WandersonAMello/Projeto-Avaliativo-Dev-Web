import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ObjetoService {

  // URL base definida no environment
  private readonly API_URL = environment.apiUrl + '/objetos/api/';

  private _storage: Storage | null = null;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private platform: Platform
  ) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  private async getHeaders(isFormData: boolean = false) {
    const token = await this._storage?.get('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }

    return headers;
  }

  // --- TRATAMENTO DE IMAGEM ---
  private corrigirUrlImagem(item: any): any {
    // 1. Prioriza a URL segura gerada pelo Serializer (url_foto)
    // Se ela existir, passamos para o campo 'foto' que o HTML usa.
    if (item.url_foto) {
      item.foto = item.url_foto;
    }

    // 2. Corrige o IP para o Emulador Android (10.0.2.2)
    if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('android')) {

      // Lógica para EMULADOR ANDROID (troca localhost por 10.0.2.2)
      if (item.foto && typeof item.foto === 'string') {
        if (item.foto.includes('localhost')) {
          item.foto = item.foto.replace('localhost', '10.0.2.2');
        } else if (item.foto.includes('127.0.0.1')) {
          item.foto = item.foto.replace('127.0.0.1', '10.0.2.2');
        }
      }
    }
    return item;
  }

  // --- MÉTODOS DE LEITURA ---

  async listar() {
    const headers = await this.getHeaders();
    const lista: any = await firstValueFrom(this.http.get(this.API_URL, { headers }));
    
    // Aplica a correção em CADA item da lista
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  async listarMeus() {
    const headers = await this.getHeaders();
    const lista: any = await firstValueFrom(this.http.get(`${this.API_URL}meus-itens/`, { headers }));
    
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  // --- MÉTODOS DE ESCRITA ---

  async cadastrar(dados: any) {
    const isFormData = dados instanceof FormData;
    const headers = await this.getHeaders(isFormData);

    try {
      const resp = await firstValueFrom(this.http.post(`${this.API_URL}criar/`, dados, { headers }));
      return { data: resp, status: 201 };
    } catch (error: any) {
      console.error('Erro cadastro:', error);
      return { status: error.status || 500, error };
    }
  }

  async editar(id: number, dados: any) {
    const isFormData = dados instanceof FormData;
    const headers = await this.getHeaders(isFormData);

    try {
      const resp = await firstValueFrom(this.http.patch(`${this.API_URL}editar/${id}/`, dados, { headers }));
      return { data: resp, status: 200 };
    } catch (error: any) {
      return { status: error.status || 500, error };
    }
  }

  async remover(id: number) {
    const headers = await this.getHeaders();
    try {
      await firstValueFrom(this.http.delete(`${this.API_URL}deletar/${id}/`, { headers }));
      return { status: 204 };
    } catch (error: any) {
      return { status: error.status || 500, error };
    }
  }
}
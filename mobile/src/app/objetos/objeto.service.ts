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

  private async getToken() {
    return await this._storage?.get('token');
  }

  private async getHeaders(isFormData: boolean = false) {
    const token = await this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  // --- ATUALIZADO: Recebe o token para anexar na URL ---
  private corrigirUrlImagem(item: any, token: string): any {
    // 1. Usa a URL do backend
    if (item.url_foto) {
      item.foto = item.url_foto;
    }

    // 2. Corrige IP para Emulador (10.0.2.2) se necessário
    if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('android')) {
      if (item.foto && typeof item.foto === 'string') {
        if (item.foto.includes('localhost')) {
          item.foto = item.foto.replace('localhost', '10.0.2.2');
        } else if (item.foto.includes('127.0.0.1')) {
          item.foto = item.foto.replace('127.0.0.1', '10.0.2.2');
        }
      }
    }

    // 3. SEGURANÇA: Adiciona o Token na URL da imagem
    // Resultado: http://.../foto.jpg?token=9944b09...
    if (item.foto && token) {
        // Verifica se já tem ? (query params) ou não
        const separador = item.foto.includes('?') ? '&' : '?';
        item.foto = `${item.foto}${separador}token=${token}`;
    }
    
    return item;
  }

  // --- LEITURA ATUALIZADA ---

  async listar() {
    const headers = await this.getHeaders();
    const token = await this.getToken(); // Pega o token aqui

    const lista: any = await firstValueFrom(this.http.get(this.API_URL, { headers }));
    
    // Passa o token para a função de correção
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item, token));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  async listarMeus() {
    const headers = await this.getHeaders();
    const token = await this.getToken(); // Pega o token aqui

    const lista: any = await firstValueFrom(this.http.get(`${this.API_URL}meus-itens/`, { headers }));
    
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item, token));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  // ... (Os métodos de ESCRITA - cadastrar, editar, remover - permanecem iguais) ...
  async cadastrar(dados: any) {
    const isFormData = dados instanceof FormData;
    const headers = await this.getHeaders(isFormData);
    try {
      const resp = await firstValueFrom(this.http.post(`${this.API_URL}criar/`, dados, { headers }));
      return { data: resp, status: 201 };
    } catch (error: any) {
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

  async alternarStatus(id: number) {
    const headers = await this.getHeaders();
    try {
      // O backend espera um POST vazio apenas para triggar a mudança
      const resp = await firstValueFrom(this.http.post(`${this.API_URL}status/${id}/`, {}, { headers }));
      return { data: resp, status: 200 };
    } catch (error: any) {
      return { status: error.status || 500, error };
    }
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObjetoService {

  // URL base definida no environment (ex: http://10.0.2.2:8000/objetos/api/)
  private readonly API_URL = environment.apiUrl + '/objetos/api/';
  
  private _storage: Storage | null = null;

  constructor(
    private http: HttpClient, // Usamos HttpClient para melhor suporte a uploads
    private storage: Storage
  ) {
    this.init();
  }

  // Inicializa o banco de dados local para ler o Token salvo
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Método auxiliar para criar os cabeçalhos da requisição
  private async getHeaders(isFormData: boolean = false) {
    const token = await this._storage?.get('token');
    let headers = new HttpHeaders();
    
    // Adiciona o Token de Autenticação se existir
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    
    // Se for FormData (envio de arquivo), NÃO definimos 'Content-Type'.
    // O navegador define automaticamente como 'multipart/form-data' e adiciona as fronteiras.
    // Se não for arquivo, o Angular geralmente assume JSON, mas não faz mal deixar sem.
    return headers;
  }

  // --- CORREÇÃO VISUAL PARA EMULADOR ---
  // O Django retorna URLs como 'http://127.0.0.1:8000/media/...'.
  // O Emulador Android não acessa '127.0.0.1', ele precisa de '10.0.2.2'.
  // Esta função troca o IP automaticamente para a imagem aparecer no celular.
  private corrigirUrlImagem(item: any): any {
    if (item.foto && typeof item.foto === 'string') {
      if (item.foto.includes('localhost')) {
        item.foto = item.foto.replace('localhost', '10.0.2.2');
      } else if (item.foto.includes('127.0.0.1')) {
        item.foto = item.foto.replace('127.0.0.1', '10.0.2.2');
      }
    }
    return item;
  }

  // --- MÉTODOS DE LEITURA (GET) ---

  async listar() {
    const headers = await this.getHeaders();
    
    // firstValueFrom converte o Observable do Angular numa Promise (mais fácil de usar)
    const lista: any = await firstValueFrom(this.http.get(this.API_URL, { headers }));
    
    // Processa a lista para corrigir as URLs das fotos antes de entregar
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  async listarMeus() {
    const headers = await this.getHeaders();
    const lista: any = await firstValueFrom(this.http.get(`${this.API_URL}meus-itens/`, { headers }));
    
    const dadosCorrigidos = lista.map((item: any) => this.corrigirUrlImagem(item));
    
    return { data: dadosCorrigidos, status: 200 };
  }

  // --- MÉTODOS DE ESCRITA (POST, PATCH, DELETE) ---

  // Cadastrar (Suporta Foto via FormData)
  async cadastrar(dados: any) {
    // Verifica se estamos enviando um arquivo (FormData)
    const isFormData = dados instanceof FormData;
    const headers = await this.getHeaders(isFormData);

    try {
      // O HttpClient gerencia o envio do binário da foto automaticamente
      const resp = await firstValueFrom(this.http.post(`${this.API_URL}criar/`, dados, { headers }));
      return { data: resp, status: 201 };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      // Retorna o erro para a página tratar (ex: mostrar mensagem)
      return { status: error.status || 500, error };
    }
  }

  // Editar (Suporta Foto via FormData)
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
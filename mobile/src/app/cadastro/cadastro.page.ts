import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';

import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonInput, IonButton, IonIcon, IonButtons, LoadingController, 
  ToastController, NavController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, arrowBackOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,

  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
    IonInput, IonButton, IonIcon, IonButtons, CommonModule, FormsModule
  ]
})
export class CadastroPage implements OnInit {

  // URL dinâmica
  private readonly API_URL = environment.apiUrl + '/api/cadastro/';

  public instancia = {
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  };

  constructor(
    public controle_carregamento: LoadingController,
    public controle_toast: ToastController,
    public controle_navegacao: NavController
  ) { 
    addIcons({ personAddOutline, arrowBackOutline });
  }

  ngOnInit() {
  }

  async cadastrarUsuario() {
    if (this.instancia.password !== this.instancia.confirm_password) {
      this.apresenta_mensagem('As senhas não conferem.', 'warning');
      return;
    }

    const loading = await this.controle_carregamento.create({
      message: 'Criando conta...',
      duration: 15000
    });
    await loading.present();

    const options: HttpOptions = {
      url: this.API_URL,
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: this.instancia.username,
        email: this.instancia.email,
        password: this.instancia.password
      }
    };

    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();

        if (resposta.status === 201) {
          this.apresenta_mensagem('Conta criada com sucesso!', 'success');
          this.controle_navegacao.navigateBack('/login');
        } else {
          // Tenta extrair mensagem de erro do Django
          let erroTexto = 'Erro ao cadastrar.';
          if (resposta.data) {
             // Ex: {"username": ["A user with that username already exists."]}
             const chaves = Object.keys(resposta.data);
             if (chaves.length > 0) {
               erroTexto = `${chaves[0]}: ${resposta.data[chaves[0]]}`;
             }
          }
          this.apresenta_mensagem(erroTexto, 'danger');
        }
      })
      .catch(async (erro) => {
        console.error(erro);
        loading.dismiss();
        this.apresenta_mensagem('Falha na conexão com o servidor.', 'danger');
      });
  }

  async apresenta_mensagem(texto: string, cor: string) {
    const toast = await this.controle_toast.create({
      message: texto,
      duration: 3000,
      color: cor,
      position: 'bottom',
      cssClass: 'ion-text-center'
    });
    toast.present();
  }

  voltarLogin() {
    this.controle_navegacao.navigateBack('/login');
  }
}
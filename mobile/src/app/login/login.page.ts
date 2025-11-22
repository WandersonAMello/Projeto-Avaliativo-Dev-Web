import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Component, OnInit } from '@angular/core';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { IonContent, LoadingController, NavController, AlertController, ToastController, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { Usuario } from './usuario.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonInput, IonButton, IonContent, FormsModule],
  providers: [Storage]
})
export class LoginPage implements OnInit {

  // Estrutura para o formulário
  public instancia: { username: string, password: string } = {
    username: '',
    password: ''
  };

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController,
    public controle_toast: ToastController,
    public storage: Storage
  ) { }

  async ngOnInit() {
    await this.storage.create();
  }

  async autenticarUsuario() {
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    // 🔴 ATENÇÃO: Ajuste o IP conforme sua apresentação
    // Emulador Android Studio: 'http://10.0.2.2:8000/autenticacao-api/'
    // Navegador ou Celular via USB: 'http://SEU_IP_PC:8000/autenticacao-api/'
    const apiUrl = 'http://127.0.0.1:8000/autenticacao-api/';

    const options: HttpOptions = {
      headers: {'Content-Type': 'application/json'},
      url: apiUrl, 
      data: this.instancia
    };

    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        if(resposta.status == 200) {
          // Salva o usuário
          let usuario: Usuario = Object.assign(new Usuario(), resposta.data);
          await this.storage.set('usuario', usuario);
          
          loading.dismiss();
          
          this.controle_navegacao.navigateRoot('/objetos');
        }
        else {
          loading.dismiss();
          this.apresenta_mensagem(resposta.status);
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem(erro?.status || 0);
      });
  }

  async apresenta_mensagem(codigo: number) {
    const mensagem = await this.controle_toast.create({
      message: `Falha ao autenticar usuário: código ${codigo}`,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    mensagem.present();
  }
}
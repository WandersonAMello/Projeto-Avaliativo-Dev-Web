import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, LoadingController, NavController, AlertController, ToastController, IonList, IonItem, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Usuario } from './usuario.model';
import { addIcons } from 'ionicons';
import { logInOutline, personCircleOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonInput, IonButton, IonContent, IonIcon, FormsModule],
  providers: [Storage]
})
export class LoginPage implements OnInit {

  // url dinamica
  private readonly API_URL = environment.apiUrl + '/api/login/';

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
  ) { 
    // Registra ícones usados no HTML
    addIcons({ logInOutline, personCircleOutline, personAddOutline });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  irParaCadastro() {
    // navigateForward cria a animação de "ir para frente" (slide)
    this.controle_navegacao.navigateForward('/cadastro');
  }

  async autenticarUsuario() {
    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({
      message: 'Autenticando...', 
      duration: 15000,
      cssClass: 'custom-loading' // Classe para estilizar o loading se necessário
    });
    await loading.present();

    // Define informações do cabeçalho da requisição
    const options: HttpOptions = {
      headers: {'Content-Type': 'application/json'},
      url: this.API_URL,
      data: this.instancia
    };

    // Autentica usuário junto a API do sistema web
    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        
        // Verifica se a requisição foi processada com sucesso
        if(resposta.status == 200) {
          
          // Armazena localmente as credenciais de usuário
          // O backend retorna { token: '...' }, mapeamos isso para o Usuario
          let usuario: Usuario = Object.assign(new Usuario(), resposta.data);
          
          // Se o backend retornar apenas o token, garantimos que o username fique salvo
          if (!usuario.username) {
            usuario.username = this.instancia.username;
          }

          // Salva chaves importantes para o Service usar depois
          await this.storage.set('usuario', usuario);
          await this.storage.set('token', usuario.token); // Essencial para o ObjetoService

          // Finaliza autenticação e redireciona para interface inicial
          loading.dismiss();
          this.controle_navegacao.navigateRoot('/objetos');
        }
        else {
          // Finaliza autenticação e apresenta mensagem de erro
          loading.dismiss();
          // Tratamento para 400 (Credenciais inválidas)
          if (resposta.status === 400 || resposta.status === 401) {
            this.apresenta_mensagem('Usuário ou senha incorretos.');
          } else {
            this.apresenta_mensagem(`Erro no servidor: ${resposta.status}`);
          }
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem('Falha de conexão. Verifique se o servidor está rodando.');
      });
  }

  async apresenta_mensagem(texto: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      position: 'bottom',
      duration: 3000,
      color: 'danger', // Vermelho para erro
      cssClass: 'ion-text-center'
    });
    mensagem.present();
  }
}
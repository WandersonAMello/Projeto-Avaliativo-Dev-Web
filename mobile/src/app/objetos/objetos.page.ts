import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, LoadingController, NavController, ToastController, 
  IonButtons, IonButton, IonIcon, IonList, IonItem, IonThumbnail, IonLabel, IonFab, IonFabButton, 
  IonImg, ModalController, AlertController 
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { add, logOutOutline, trashOutline, timeOutline, locationOutline } from 'ionicons/icons';

import { Usuario } from '../login/usuario.model';
import { NovoObjetoComponent } from './novo-objeto/novo-objeto.component';

@Component({
  standalone: true,
  selector: 'app-objetos',
  templateUrl: './objetos.page.html',
  styleUrls: ['./objetos.page.scss'],
  imports: [
    IonFab, IonFabButton, IonImg, IonThumbnail, IonLabel, IonItem, IonList, 
    IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule
  ],
  providers: [Storage]
})
export class ObjetosPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public lista_objetos: any[] = [];

  constructor(
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) { 
    addIcons({ add, logOutOutline, trashOutline, timeOutline, locationOutline });
  }

  async ngOnInit() {
    // Verifica se existe registro de configuração para o último usuário autenticado
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if(registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.consultarObjetosWeb();
    }
    else{
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  ionViewWillEnter() {
    // Garante atualização ao voltar para a tela (se usuário já estiver carregado)
    if (this.usuario && this.usuario.token) {
        this.consultarObjetosWeb();
    }
  }

  async consultarObjetosWeb() {
    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Pesquisando...', duration: 60000});
    await loading.present();

    // Define informações do cabeçalho da requisição
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: 'http://127.0.0.1:8000/objetos/api/'
    };

    CapacitorHttp.get(options)
      .then(async (resposta: HttpResponse) => {
        // Verifica se a requisição foi processada com sucesso
        if(resposta.status == 200) {
          this.lista_objetos = resposta.data;
          
          // Finaliza interface com efeito de carregamento
          loading.dismiss();
        }
        else {
          // Finaliza e apresenta mensagem de erro
          loading.dismiss();
          this.apresenta_mensagem(`Falha ao consultar objetos: código ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem(`Falha ao consultar objetos: código ${erro?.status}`);
      });
  }

  async excluir(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Deseja realmente excluir este item?',
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, Excluir',
          handler: async () => {
             this.excluirObjeto(id);
          }
        }
      ]
    });
    await alert.present();
  }

  async excluirObjeto(id: number) {
    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Excluindo...', duration: 30000});
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/objetos/api/${id}/`
    };

    CapacitorHttp.delete(options)
      .then(async (resposta: HttpResponse) => {
        // Verifica se a requisição foi processada com sucesso (204 No Content)
        if(resposta.status == 204) {
          loading.dismiss();
        }
        else {
          loading.dismiss();
          this.apresenta_mensagem(`Falha ao excluir o objeto: código ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem(`Falha ao excluir o objeto: código ${erro?.status}`);
      })
      .finally(() => {
        // Consulta novamente a lista de objetos
        this.lista_objetos = [];
        this.consultarObjetosWeb();
      });
  }

  async novoRegistro() {
    const modal = await this.modalCtrl.create({
      component: NovoObjetoComponent
    });

    await modal.present();

    // Aguarda o modal fechar para ver se precisa atualizar a lista
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.consultarObjetosWeb();
    }
  }

  async logout() {
    await this.storage.remove('usuario');
    this.controle_navegacao.navigateRoot('/login');
  }

  async apresenta_mensagem(texto: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    mensagem.present();
  }
}
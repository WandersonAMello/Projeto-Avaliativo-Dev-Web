import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para o *ngFor e date pipe
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
  IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton, 
  AlertController, ToastController, NavController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline, trashOutline, timeOutline, locationOutline } from 'ionicons/icons';
import { ObjetoService } from './objeto.service'; //
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-objetos',
  templateUrl: './objetos.page.html',
  styleUrls: ['./objetos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
    IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton,
    CommonModule, FormsModule
  ],
  providers: [Storage]
})
export class ObjetosPage implements OnInit {

  public lista_objetos: any[] = [];

  constructor(
    private service: ObjetoService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private storage: Storage
  ) {
    // Registra os ícones que vamos usar no HTML
    addIcons({ add, logOutOutline, trashOutline, timeOutline, locationOutline });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  // Executado toda vez que a página entra em foco (melhor que ngOnInit para listas dinâmicas)
  ionViewWillEnter() {
    this.carregarLista();
  }

  async carregarLista() {
    try {
      const resposta = await this.service.listar();
      if (resposta.status === 200) {
        this.lista_objetos = resposta.data;
      }
    } catch (erro) {
      console.error(erro);
      this.mostrarToast('Erro ao carregar objetos.');
    }
  }

  async novoRegistro() {
    const alert = await this.alertCtrl.create({
      header: 'Novo Achado',
      inputs: [
        { name: 'descricao', type: 'text', placeholder: 'Descrição (ex: Casaco Azul)' },
        { name: 'local', type: 'text', placeholder: 'Local (ex: BLOCO_A)' }, 
        // Nota: Para ser perfeito, 'local' deveria ser um select, mas text funciona para teste
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (dados) => {
            if (!dados.descricao || !dados.local) {
              this.mostrarToast('Preencha todos os campos!');
              return false; // Mantém o alerta aberto
            }
            
            // Chama o serviço para salvar
            try {
                // Passamos 'NOVO' como estado padrão
                const resp = await this.service.cadastrar(dados.descricao, dados.local, 'NOVO');
                if (resp.status === 201) {
                    this.mostrarToast('Cadastrado com sucesso!');
                    this.carregarLista(); // Atualiza a lista na hora
                    return true;
                }
            } catch (e) {
                this.mostrarToast('Erro ao salvar.');
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
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
            try {
              await this.service.remover(id);
              this.carregarLista();
              this.mostrarToast('Item removido.');
            } catch (error) {
              this.mostrarToast('Erro ao excluir.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.storage.remove('usuario');
    this.navCtrl.navigateRoot('/login');
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
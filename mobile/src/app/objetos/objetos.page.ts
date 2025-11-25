import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf e *ngFor se misturar sintaxe
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonImg, IonThumbnail, IonLabel, IonFab, IonFabButton,
  ToastController, NavController, ModalController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline, trashOutline, timeOutline, locationOutline } from 'ionicons/icons';
import { ObjetoService } from './objeto.service';
import { Storage } from '@ionic/storage-angular';
import { NovoObjetoComponent } from './novo-objeto/novo-objeto.component';

@Component({
  selector: 'app-objetos',
  templateUrl: './objetos.page.html',
  styleUrls: ['./objetos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton,
    IonImg, IonThumbnail, // <--- Adicionado para suportar imagens
    CommonModule, FormsModule
  ],
  providers: [Storage]
})
export class ObjetosPage implements OnInit {

  public lista_objetos: any[] = [];

  constructor(
    private service: ObjetoService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController, // <--- Adicionado (estava faltando para o método excluir)
    private navCtrl: NavController,
    private storage: Storage
  ) {
    addIcons({ add, logOutOutline, trashOutline, timeOutline, locationOutline });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  // Garante que a lista atualize sempre que você voltar para essa tela
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

  // Abre o Modal (Janela sobreposta) com o componente de cadastro
  async novoRegistro() {
    const modal = await this.modalCtrl.create({
      component: NovoObjetoComponent
    });

    await modal.present();

    // Aguarda o modal fechar para ver se precisa atualizar a lista
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.carregarLista();
    }
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
              this.carregarLista(); // Atualiza a lista visualmente
              this.mostrarToast('Item removido.');
            } catch (e) {
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
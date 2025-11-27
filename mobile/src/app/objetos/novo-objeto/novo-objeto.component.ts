import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
  IonItem, IonInput, IonLabel, IonList, IonIcon, IonModal, IonSearchbar, 
  IonThumbnail, IonFooter, ModalController, LoadingController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, close, search } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ObjetoService } from '../objeto.service';

@Component({
  selector: 'app-novo-objeto',
  templateUrl: './novo-objeto.component.html',
  styleUrls: ['./novo-objeto.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
    IonItem, IonInput, IonLabel, IonList, IonIcon, IonModal, IonSearchbar,
    IonThumbnail, IonFooter
  ]
})
export class NovoObjetoComponent {

  // Dados do formulário
  descricao: string = '';
  localSelecionado: { valor: string, nome: string } | null = null;
  fotoPreview: string | null = null;
  fotoBlob: Blob | null = null;

  // Lista de locais (Hardcoded igual ao Backend para garantir compatibilidade)
  // O ideal seria buscar da API, mas para o trabalho isso resolve.
  todosLocais = [
    { valor: 'BLOCO_A', nome: 'Bloco A' },
    { valor: 'BLOCO_B', nome: 'Bloco B' },
    { valor: 'BLOCO_C', nome: 'Bloco C' },
    { valor: 'CANTINA', nome: 'Cantina' },
    { valor: 'BIBLIOTECA', nome: 'Biblioteca' },
    { valor: 'ESTACIONAMENTO', nome: 'Estacionamento' },
    { valor: 'PRAINHA', nome: 'Prainha' }
  ];
  
  // Lista filtrada para a busca
  locaisFiltrados = [...this.todosLocais];

  constructor(
    private modalCtrl: ModalController,
    private service: ObjetoService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ camera, close, search });
  }

  // Filtra a lista conforme o usuário digita
  filtrarLocais(event: any) {
    const texto = event.target.value.toLowerCase();
    this.locaisFiltrados = this.todosLocais.filter(local => 
      local.nome.toLowerCase().includes(texto)
    );
  }

  escolherLocal(local: any, modal: any) {
    this.localSelecionado = local;
    modal.dismiss(); // Fecha o modal de seleção
  }

  async tirarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera // Ou Prompt para escolher entre Galeria/Camera
      });

      this.fotoPreview = image.webPath!;
      
      // Converte para Blob para envio
      const response = await fetch(image.webPath!);
      this.fotoBlob = await response.blob();

    } catch (error) {
      console.log('Usuário cancelou ou erro na câmera', error);
    }
  }

  async salvar() {
    if (!this.descricao || !this.localSelecionado) {
      this.mostrarToast('Preencha descrição e local!');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    try {
      const formData = new FormData();
      formData.append('descricao', this.descricao);
      formData.append('local', this.localSelecionado.valor);
      formData.append('estado', 'NOVO'); // Padrão
      
      if (this.fotoBlob) {
        // O nome do arquivo 'foto.jpeg' é importante para o Django reconhecer
        formData.append('foto', this.fotoBlob, 'foto.jpeg');
      }

      const resp = await this.service.cadastrar(formData);
      
      loading.dismiss();
      
      if (resp.status === 201) {
        this.mostrarToast('Objeto cadastrado!');
        this.modalCtrl.dismiss(true); // Retorna true para indicar sucesso
      } else {
        this.mostrarToast('Erro ao salvar: ' + resp.status);
      }
    } catch (erro) {
      loading.dismiss();
      console.error(erro);
      this.mostrarToast('Erro de conexão.');
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000 });
    toast.present();
  }
}
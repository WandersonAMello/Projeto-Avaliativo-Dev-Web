import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importação dos componentes visuais do Ionic (Standalone)
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, NavController, ToastController, 
  IonButtons, IonButton, IonIcon, IonList, IonFab, IonFabButton, 
  ModalController, AlertController, IonSegment, IonSegmentButton, IonBadge,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonLabel
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
// Importação dos ícones usados no HTML
import { add, logOutOutline, trashOutline, timeOutline, locationOutline, createOutline, refreshOutline, imagesOutline } from 'ionicons/icons';

import { Usuario } from '../login/usuario.model';
import { NovoObjetoComponent } from './novo-objeto/novo-objeto.component';
import { ObjetoService } from './objeto.service';
import { DetalheObjetoComponent } from './detalhe-objeto/detalhe-objeto.component';
@Component({
  standalone: true,
  selector: 'app-objetos',
  templateUrl: './objetos.page.html',
  styleUrls: ['./objetos.page.scss'],
  // Lista de componentes que podem ser usados no HTML
  imports: [
    IonFab, IonFabButton, IonIcon, IonButton, IonButtons, 
    IonContent, IonHeader, IonTitle, IonToolbar, IonList,
    CommonModule, FormsModule, IonSegment, IonSegmentButton, IonBadge,
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonRefresher, IonRefresherContent, IonSkeletonText, IonLabel,
  ],
  providers: [Storage]
})
export class ObjetosPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public lista_objetos: any[] = [];
  
  // Controla qual aba está ativa ('todos' ou 'meus')
  public segmentoSelecionado: string = 'todos';
  
  // Controla se o esqueleto de carregamento (skeleton) deve aparecer
  public isLoading: boolean = true;

  constructor(
    public storage: Storage,
    public service: ObjetoService,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) { 
    // Registo dos ícones para serem usados com name="icone"
    addIcons({ add, logOutOutline, trashOutline, timeOutline, locationOutline, createOutline, refreshOutline, imagesOutline });
  }

  async ngOnInit() {
    // 1. Inicializa o banco local
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    // 2. Verifica se o usuário está logado
    if(registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      // Carrega os dados iniciais mostrando o Skeleton (true)
      this.carregarDados(true);
    } else {
      // Se não tiver usuário, manda pro login
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  // Executado sempre que a tela vai aparecer (bom para atualizar dados ao voltar)
  ionViewWillEnter() {
    if (this.usuario && this.usuario.token) {
        // Atualiza silenciosamente sem mostrar o Skeleton (false)
        this.carregarDados(false);
    }
  }

  // Função chamada ao puxar a tela para baixo (Pull-to-Refresh)
  handleRefresh(event: any) {
    this.carregarDados(false).then(() => {
      // Avisa o componente visual que terminou de carregar
      event.target.complete();
    });
  }

  // Função central para buscar dados da API
  async carregarDados(usarSkeleton: boolean = false) {
    if (usarSkeleton) this.isLoading = true;

    try {
      let resp;
      
      // Decide qual endpoint chamar baseado na aba selecionada
      if (this.segmentoSelecionado === 'todos') {
        resp = await this.service.listar(); // API pública
      } else {
        resp = await this.service.listarMeus(); // API privada
      }

      if (resp.status === 200) {
        this.lista_objetos = resp.data;
      }
    } catch (erro) {
      // Falha silenciosa para não incomodar o usuário com popups constantes
      console.error(erro);
    } finally {
      // Remove o Skeleton após um pequeno delay (estético)
      if (usarSkeleton) {
        setTimeout(() => this.isLoading = false, 500); 
      }
    }
  }

  // Chamado quando o usuário clica nas abas (Mural / Meus Itens)
  trocarSegmento(event: any) {
    this.segmentoSelecionado = event.detail.value;
    this.lista_objetos = []; // Limpa a lista atual
    this.carregarDados(true); // Recarrega com efeito de Skeleton
  }

  //Arbir modal de detalhes do objeto
  async verDetalhes(item: any) {
    const modal = await this.modalCtrl.create({
      component: DetalheObjetoComponent,
      componentProps: { objeto: item }
    });
    await modal.present();
  }

  // Abre o formulário de cadastro ou edição
  async abrirModal(itemParaEditar: any = null) {
    const modal = await this.modalCtrl.create({
      component: NovoObjetoComponent,
      componentProps: { objetoEditar: itemParaEditar }, // Passa dados se for edição
      breakpoints: [0, 0.9, 1], // Efeito de "folha" que sobe
      initialBreakpoint: 0.9,
    });

    await modal.present();

    // Espera o modal fechar para ver se precisa atualizar a lista
    const { data } = await modal.onWillDismiss();
    if (data) this.carregarDados(false);
  }

  // Exibe alerta de confirmação antes de excluir
  async confirmarExclusao(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir Item',
      message: 'Tem certeza? Esta ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          cssClass: 'alert-button-danger', // Estilo vermelho
          handler: () => this.excluirObjeto(id) // Chama a exclusão real
        }
      ]
    });
    await alert.present();
  }

  async excluirObjeto(id: number) {
    try {
      const resp = await this.service.remover(id);
      if (resp.status === 204) {
        this.apresenta_mensagem('Item excluído.');
        this.carregarDados(false); // Atualiza a lista
      } else {
        this.apresenta_mensagem('Erro ao excluir.');
      }
    } catch (erro) {
      this.apresenta_mensagem('Erro de conexão.');
    }
  }

  async logout() {
    // Limpa dados e volta pro login
    await this.storage.remove('usuario');
    await this.storage.remove('token');
    this.controle_navegacao.navigateRoot('/login');
  }

  async apresenta_mensagem(texto: string) {
    const toast = await this.controle_toast.create({
      message: texto,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}
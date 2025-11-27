import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importação dos componentes visuais necessários
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
  IonItem, IonInput, IonLabel, IonList, IonIcon, IonModal, IonSearchbar, 
  IonFooter, ModalController, LoadingController, ToastController,
  IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton,
  IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, close, search, calendar, call, location, checkmarkCircle, alertCircle, save } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ObjetoService } from '../objeto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-novo-objeto',
  templateUrl: './novo-objeto.component.html',
  styleUrls: ['./novo-objeto.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
    IonItem, IonInput, IonLabel, IonList, IonIcon, IonModal, IonSearchbar,
    IonFooter, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton,
    IonGrid, IonRow, IonCol
  ]
})
export class NovoObjetoComponent implements OnInit {

  // Recebe dados se estivermos editando um item existente
  @Input() objetoEditar: any = null;

  // Variáveis do Formulário
  descricao: string = '';
  situacao: string = 'ACHADO'; // Valor padrão: Encontrei
  tipo: string = 'OUTRO';
  localSelecionado: { valor: string, nome: string } | null = null;
  dataEncontro: string = new Date().toISOString(); // Começa com a data de hoje
  contato: string = '';
  
  // Controle de Imagens
  fotoPreview: string | null = null; // Para mostrar na tela
  fotoBlob: Blob | null = null;      // Para enviar ao servidor
  // --- LISTAS IGUAIS AO DJANGO (consts.py) ---
  
  listaTipos = [
    { valor: 'ELETRONICOS', nome: 'Eletrônicos' },
    { valor: 'CHAVES', nome: 'Chaves' },
    { valor: 'CARTEIRA', nome: 'Carteira' },
    { valor: 'DOCUMENTOS', nome: 'Documentos' },
    { valor: 'VESTUARIO', nome: 'Vestuário' },
    { valor: 'OUTRO', nome: 'Outro' }
  ];

  todosLocais = [
    // Blocos Letras
    { valor: 'BLOCO_A', nome: 'Bloco A' },
    { valor: 'BLOCO_B', nome: 'Bloco B' },
    { valor: 'BLOCO_C', nome: 'Bloco C' },
    { valor: 'BLOCO_D', nome: 'Bloco D' },
    { valor: 'BLOCO_E', nome: 'Bloco E' },
    { valor: 'BLOCO_F', nome: 'Bloco F' },
    { valor: 'BLOCO_G', nome: 'Bloco G' },
    { valor: 'BLOCO_H', nome: 'Bloco H' },
    // Blocos Romanos
    { valor: 'BLOCO_I', nome: 'Bloco I' },
    { valor: 'BLOCO_II', nome: 'Bloco II' },
    { valor: 'BLOCO_III', nome: 'Bloco III' },
    { valor: 'BLOCO_IV', nome: 'Bloco IV' },
    // Outros
    { valor: 'REITORIA', nome: 'Reitoria' },
    { valor: 'RU', nome: 'Restaurante Universitário' },
    { valor: 'PRAINHA', nome: 'Prainha' },
    { valor: 'BALA_I', nome: 'Bala I' },
    { valor: 'BALA_II', nome: 'Bala II' },
  ];

  // Lista filtrada para a busca no modal de locais
  locaisFiltrados = [...this.todosLocais];

  constructor(
    private modalCtrl: ModalController,
    private service: ObjetoService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ camera, close, search, calendar, call, location, checkmarkCircle, alertCircle, save });
  }

  ngOnInit() {
    // Se estivermos em modo EDIÇÃO, preenchemos o formulário com os dados existentes
    if (this.objetoEditar) {
      this.descricao = this.objetoEditar.descricao;
      this.situacao = this.objetoEditar.situacao;
      this.tipo = this.objetoEditar.tipo;
      this.dataEncontro = this.objetoEditar.data_encontro;
      this.contato = this.objetoEditar.contato;
      
      // Encontra o objeto de local correto na lista para exibir o nome bonito
      const localFound = this.todosLocais.find(l => l.valor === this.objetoEditar.local);
      if (localFound) this.localSelecionado = localFound;

      // Configura a pré-visualização da foto existente
      if (this.objetoEditar.foto) {
        if (this.objetoEditar.foto.startsWith('http')) {
             this.fotoPreview = this.objetoEditar.foto;
        } else {
             // Adiciona a URL do servidor se o caminho for relativo
             this.fotoPreview = environment.apiUrl + this.objetoEditar.foto;
        }
      }
    }
  }

  // Filtro de pesquisa para a lista de Locais
  filtrarLocais(event: any) {
    const texto = event.target.value.toLowerCase();
    this.locaisFiltrados = this.todosLocais.filter(local => 
      local.nome.toLowerCase().includes(texto)
    );
  }

  // Ação ao selecionar um local da lista
  escolherLocal(local: any, modal: any) {
    this.localSelecionado = local;
    modal.dismiss();
  }

  // Ação do botão de Câmera
  async tirarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,             // Qualidade média para não ficar pesado
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt // Deixa o usuário escolher (Galeria ou Câmera)
      });

      this.fotoPreview = image.webPath!;
      
      // Converte a imagem para Blob (arquivo binário) para envio
      const response = await fetch(image.webPath!);
      this.fotoBlob = await response.blob();

    } catch (error) {
      // Usuário cancelou ou erro de permissão
      console.log('Camera cancelada');
    }
  }

  async salvar() {
    // Validação básica
    if (!this.descricao || !this.localSelecionado) {
      this.mostrarToast('Preencha a descrição e o local.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    try {
      const dataFormatada = this.dataEncontro.split('T')[0];
      let resp;

      // CENÁRIO 1: Envio com FOTO NOVA (Requer FormData)
      if (this.fotoBlob) {
          const formData = new FormData();
          formData.append('descricao', this.descricao);
          formData.append('local', this.localSelecionado.valor);
          formData.append('situacao', this.situacao);
          formData.append('tipo', this.tipo);
          formData.append('contato', this.contato || '');
          formData.append('data_encontro', dataFormatada);
          // O terceiro parâmetro 'foto.jpeg' é importante para o Django aceitar como arquivo
          formData.append('foto', this.fotoBlob, 'foto.jpeg');

          if (this.objetoEditar) {
              resp = await this.service.editar(this.objetoEditar.id, formData);
          } else {
              resp = await this.service.cadastrar(formData);
          }
      } 
      // CENÁRIO 2: Envio SEM FOTO NOVA (Pode usar JSON simples ou FormData sem arquivo)
      else {
          if (this.objetoEditar) {
              const dadosJSON = {
                  descricao: this.descricao,
                  local: this.localSelecionado.valor,
                  situacao: this.situacao,
                  tipo: this.tipo,
                  contato: this.contato,
                  data_encontro: dataFormatada
              };
              resp = await this.service.editar(this.objetoEditar.id, dadosJSON);
          } else {
              // Na criação, usamos FormData por padrão para manter consistência
              const formData = new FormData();
              formData.append('descricao', this.descricao);
              formData.append('local', this.localSelecionado.valor);
              formData.append('situacao', this.situacao);
              formData.append('tipo', this.tipo);
              formData.append('contato', this.contato || '');
              formData.append('data_encontro', dataFormatada);
              
              resp = await this.service.cadastrar(formData);
          }
      }

      loading.dismiss();

      if (resp.status === 200 || resp.status === 201) {
        this.mostrarToast('Salvo com sucesso!', 'success');
        this.modalCtrl.dismiss(true); // Fecha o modal e avisa que salvou
      } else {
        this.mostrarToast('Erro ao salvar no servidor.', 'danger');
      }

    } catch (erro) {
      console.error(erro);
      loading.dismiss();
      this.mostrarToast('Erro de conexão.', 'danger');
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  async mostrarToast(msg: string, cor: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000, 
      color: cor,
      position: 'bottom' 
    });
    toast.present();
  }
}
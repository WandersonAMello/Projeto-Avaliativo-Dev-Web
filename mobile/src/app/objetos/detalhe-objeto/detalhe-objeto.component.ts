import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
  IonIcon, IonImg, IonBadge, IonList, IonItem, IonLabel, IonFooter, ModalController,
  IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Ícones usados no layout
import { close, logoWhatsapp, timeOutline, locationOutline, personOutline, calendarOutline, informationCircleOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detalhe-objeto',
  templateUrl: './detalhe-objeto.component.html',
  styleUrls: ['./detalhe-objeto.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
    IonIcon, IonImg, IonBadge, IonList, IonItem, IonLabel, IonFooter,
    IonGrid, IonRow, IonCol
  ]
})
export class DetalheObjetoComponent implements OnInit {

  @Input() objeto: any;
  
  public fotoUrl: string | null = null;

  constructor(private modalCtrl: ModalController) {
    addIcons({ close, logoWhatsapp, timeOutline, locationOutline, personOutline, calendarOutline, informationCircleOutline });
  }

  ngOnInit() {
    if (this.objeto) {
      // Prioriza a URL segura gerada pelo backend, se não tiver, tenta montar
      if (this.objeto.url_foto) {
        this.fotoUrl = this.objeto.url_foto;
      } else if (this.objeto.foto) {
        this.fotoUrl = this.objeto.foto.startsWith('http') 
          ? this.objeto.foto 
          : environment.apiUrl + this.objeto.foto;
      }
      
      // Correção de IP para emulador (se necessário)
      if (this.fotoUrl && (this.fotoUrl.includes('localhost') || this.fotoUrl.includes('127.0.0.1'))) {
        this.fotoUrl = this.fotoUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
      }
    }
  }

  abrirWhatsApp() {
    if (this.objeto.contato) {
      const numero = this.objeto.contato.replace(/\D/g, '');
      const mensagem = `Olá! Vi seu anúncio no Achados e Perdidos da UFT sobre: ${this.objeto.descricao}.`;
      const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_system');
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }
}
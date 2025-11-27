import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
  IonIcon, IonImg, IonBadge, IonList, IonItem, IonLabel, IonFooter, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, logoWhatsapp, timeOutline, locationOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detalhe-objeto',
  templateUrl: './detalhe-objeto.component.html',
  styleUrls: ['./detalhe-objeto.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
    IonIcon, IonImg, IonBadge, IonList, IonItem, IonLabel, IonFooter
  ]
})
export class DetalheObjetoComponent implements OnInit {

  @Input() objeto: any;
  
  public fotoUrl: string | null = null;
  public diasCustodia: number = 0;

  constructor(private modalCtrl: ModalController) {
    addIcons({ close, logoWhatsapp, timeOutline, locationOutline, personOutline, calendarOutline });
  }

  ngOnInit() {
    if (this.objeto) {
      // 1. Trata a URL da foto
      if (this.objeto.foto) {
        this.fotoUrl = this.objeto.foto.startsWith('http') 
          ? this.objeto.foto 
          : environment.apiUrl + this.objeto.foto;
      }

      // 2. Calcula dias em custódia
      if (this.objeto.data_encontro) {
        const dataEncontro = new Date(this.objeto.data_encontro);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - dataEncontro.getTime());
        this.diasCustodia = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      }
    }
  }

  abrirWhatsApp() {
    if (this.objeto.contato) {
      // Remove caracteres não numéricos
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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetalheObjetoComponent } from './detalhe-objeto.component';

describe('DetalheObjetoComponent', () => {
  let component: DetalheObjetoComponent;
  let fixture: ComponentFixture<DetalheObjetoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DetalheObjetoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheObjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

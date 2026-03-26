import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Certificate } from './certificate';

describe('Certificate', () => {
  let component: Certificate;
  let fixture: ComponentFixture<Certificate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Certificate],
    }).compileComponents();

    fixture = TestBed.createComponent(Certificate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramDetailsComponent } from './program-details';

describe('ProgramDetails', () => {
  let component: ProgramDetailsComponent;
  let fixture: ComponentFixture<ProgramDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

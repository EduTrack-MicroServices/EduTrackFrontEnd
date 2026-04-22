import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Analysispage } from './analysispage';

describe('Analysispage', () => {
  let component: Analysispage;
  let fixture: ComponentFixture<Analysispage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Analysispage],
    }).compileComponents();

    fixture = TestBed.createComponent(Analysispage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Studentprogress } from './studentprogress';

describe('Studentprogress', () => {
  let component: Studentprogress;
  let fixture: ComponentFixture<Studentprogress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Studentprogress],
    }).compileComponents();

    fixture = TestBed.createComponent(Studentprogress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

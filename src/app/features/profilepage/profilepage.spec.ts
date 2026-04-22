import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilepage } from './profilepage';

describe('Profilepage', () => {
  let component: Profilepage;
  let fixture: ComponentFixture<Profilepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profilepage],
    }).compileComponents();

    fixture = TestBed.createComponent(Profilepage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

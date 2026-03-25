import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTakeComponent } from './assessment-take';

describe('AssessmentTakeComponent', () => {
  let component: AssessmentTakeComponent;
  let fixture: ComponentFixture<AssessmentTakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentTakeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentTakeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentScoreComponent } from './assessment-score';

describe('AssessmentScoreComponent', () => {
  let component: AssessmentScoreComponent;
  let fixture: ComponentFixture<AssessmentScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentScoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentScoreComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

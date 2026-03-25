import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentView } from './assessment-view';

describe('AssessmentView', () => {
  let component: AssessmentView;
  let fixture: ComponentFixture<AssessmentView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentView],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

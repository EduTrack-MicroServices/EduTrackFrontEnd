import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleViewerComponent } from './module-viewer';

describe('ModuleViewerComponent', () => {
  let component: ModuleViewerComponent;
  let fixture: ComponentFixture<ModuleViewerComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

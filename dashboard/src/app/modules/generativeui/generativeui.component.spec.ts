import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeuiComponent } from './generativeui.component';

describe('GenerativeuiComponent', () => {
  let component: GenerativeuiComponent;
  let fixture: ComponentFixture<GenerativeuiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerativeuiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerativeuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

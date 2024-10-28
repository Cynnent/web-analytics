import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlinkComponent } from './shortlink.component';

describe('ShortlinkComponent', () => {
  let component: ShortlinkComponent;
  let fixture: ComponentFixture<ShortlinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShortlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

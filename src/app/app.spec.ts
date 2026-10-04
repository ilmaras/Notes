import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { NOTES_STORAGE_KEY } from './notes-storage';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('creates the app and renders its title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Mano užrašinė');
  });

  it('adds and deletes a note through the interface', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('#note-title') as HTMLInputElement;
    const text = fixture.nativeElement.querySelector('#note-text') as HTMLTextAreaElement;
    title.value = 'Susitikimas';
    title.dispatchEvent(new Event('input'));
    text.value = 'Parengti klausimų sąrašą.';
    text.dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.note-card h3')?.textContent).toContain(
      'Susitikimas',
    );
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '[]')).toHaveLength(1);

    const deleteButton = fixture.nativeElement.querySelector('.delete-button') as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.note-card')).toBeNull();
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});

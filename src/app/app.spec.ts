import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('creates the app and renders its title', () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/notes').flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Mano užrašinė');
  });

  it('adds and deletes a note through the interface', async () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/notes').flush([]);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('#note-title') as HTMLInputElement;
    const text = fixture.nativeElement.querySelector('#note-text') as HTMLTextAreaElement;
    title.value = 'Susitikimas';
    title.dispatchEvent(new Event('input'));
    text.value = 'Parengti klausimų sąrašą.';
    text.dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    const createRequest = http.expectOne('/api/notes');
    expect(title.value).toBe('Susitikimas');

    createRequest.flush({
      id: 'note-1',
      title: 'Susitikimas',
      text: 'Parengti klausimų sąrašą.',
      createdAt: '2026-10-04T10:00:00.000Z',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(title.value).toBe('');
    expect(fixture.nativeElement.querySelector('.note-card h3')?.textContent).toContain(
      'Susitikimas',
    );

    const deleteButton = fixture.nativeElement.querySelector('.delete-button') as HTMLButtonElement;
    deleteButton.click();
    http.expectOne('/api/notes/note-1').flush(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.note-card')).toBeNull();
  });

  it('keeps the form values when the API rejects a note', async () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/notes').flush([]);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('#note-title') as HTMLInputElement;
    const text = fixture.nativeElement.querySelector('#note-text') as HTMLTextAreaElement;
    title.value = 'Neišsaugotas įrašas';
    title.dispatchEvent(new Event('input'));
    text.value = 'Šis tekstas turi likti formoje.';
    text.dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    http.expectOne('/api/notes').flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(title.value).toBe('Neišsaugotas įrašas');
    expect(text.value).toBe('Šis tekstas turi likti formoje.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Nepavyko prisijungti',
    );
  });
});

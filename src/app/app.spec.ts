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
    await fixture.whenStable();
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
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('Nepavyko sukurti įrašo');

    const dismissButton = alert.querySelector('button') as HTMLButtonElement;
    dismissButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('loads a note into the form and saves its changes', async () => {
    const fixture = TestBed.createComponent(App);
    const note = {
      id: 'note-1',
      title: 'Senas pavadinimas',
      text: 'Senas tekstas',
      createdAt: '2026-10-04T10:00:00.000Z',
    };
    http.expectOne('/api/notes').flush([note]);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('.edit-button') as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('#note-title') as HTMLInputElement;
    const text = fixture.nativeElement.querySelector('#note-text') as HTMLTextAreaElement;
    expect(title.value).toBe('Senas pavadinimas');
    expect(text.value).toBe('Senas tekstas');
    expect(fixture.nativeElement.querySelector('#note-form-title')?.textContent).toContain(
      'Redaguoti įrašą',
    );

    title.value = 'Naujas pavadinimas';
    title.dispatchEvent(new Event('input'));
    text.value = 'Naujas tekstas';
    text.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    const updateRequest = http.expectOne('/api/notes/note-1');
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({ ...note, title: 'Naujas pavadinimas', text: 'Naujas tekstas' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(title.value).toBe('');
    expect(fixture.nativeElement.querySelector('#note-form-title')?.textContent).toContain(
      'Naujas įrašas',
    );
    expect(fixture.nativeElement.querySelector('.note-card h3')?.textContent).toContain(
      'Naujas pavadinimas',
    );
  });

  it('keeps edited values after an error and allows cancelling the edit', async () => {
    const fixture = TestBed.createComponent(App);
    const note = {
      id: 'note-1',
      title: 'Senas pavadinimas',
      text: 'Senas tekstas',
      createdAt: '2026-10-04T10:00:00.000Z',
    };
    http.expectOne('/api/notes').flush([note]);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.edit-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('#note-title') as HTMLInputElement;
    const text = fixture.nativeElement.querySelector('#note-text') as HTMLTextAreaElement;
    title.value = 'Neišsaugotas pavadinimas';
    title.dispatchEvent(new Event('input'));
    text.value = 'Neišsaugotas tekstas';
    text.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    http.expectOne('/api/notes/note-1').flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(title.value).toBe('Neišsaugotas pavadinimas');
    expect(text.value).toBe('Neišsaugotas tekstas');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Nepavyko atnaujinti įrašo',
    );

    (fixture.nativeElement.querySelector('.cancel-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(title.value).toBe('');
    expect(text.value).toBe('');
    expect(fixture.nativeElement.querySelector('#note-form-title')?.textContent).toContain(
      'Naujas įrašas',
    );
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Note } from './note';
import { NotesStorage } from './notes-storage';

describe('NotesStorage', () => {
  let http: HttpTestingController;
  let storage: NotesStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(NotesStorage);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads notes from the API', () => {
    const note = createNote();

    http.expectOne('/api/notes').flush([note]);

    expect(storage.notes()).toEqual([note]);
    expect(storage.loading()).toBe(false);
  });

  it('adds a note through the API', async () => {
    http.expectOne('/api/notes').flush([]);

    const added = storage.add({ title: 'Pirmas užrašas', text: 'Svarbus tekstas' });
    const request = http.expectOne('/api/notes');
    expect(request.request.method).toBe('POST');
    request.flush(createNote());

    expect(await added).toBe(true);
    expect(storage.notes()).toHaveLength(1);
  });

  it('removes a note through the API', async () => {
    const note = createNote();
    http.expectOne('/api/notes').flush([note]);

    const removed = storage.remove(note.id);
    const request = http.expectOne(`/api/notes/${note.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(await removed).toBe(true);
    expect(storage.notes()).toEqual([]);
  });

  it('updates a note through the API', async () => {
    const note = createNote();
    http.expectOne('/api/notes').flush([note]);

    const updated = storage.update(note.id, { title: 'Pakeistas', text: 'Naujas tekstas' });
    const request = http.expectOne(`/api/notes/${note.id}`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ ...note, title: 'Pakeistas', text: 'Naujas tekstas' });

    expect(await updated).toBe(true);
    expect(storage.notes()[0]).toEqual({
      ...note,
      title: 'Pakeistas',
      text: 'Naujas tekstas',
    });
  });

  it('reports an API connection error', () => {
    http.expectOne('/api/notes').flush(null, { status: 500, statusText: 'Server Error' });

    expect(storage.loading()).toBe(false);
    expect(storage.error()).toContain('Nepavyko įkelti');
    expect(storage.error()).toContain('Duomenų saugyklos klaida');
  });

  it('reports a missing note without changing its local value', async () => {
    const note = createNote();
    http.expectOne('/api/notes').flush([note]);

    const updated = storage.update(note.id, { title: 'Pakeistas', text: 'Naujas tekstas' });
    http.expectOne(`/api/notes/${note.id}`).flush(null, { status: 404, statusText: 'Not Found' });

    expect(await updated).toBe(false);
    expect(storage.notes()).toEqual([note]);
    expect(storage.error()).toBe('Redaguojamas įrašas neberastas.');
  });

  it('reports a connection error when the API is unavailable', async () => {
    http.expectOne('/api/notes').flush([]);

    const added = storage.add({ title: 'Naujas', text: 'Tekstas' });
    http.expectOne('/api/notes').error(new ProgressEvent('error'));

    expect(await added).toBe(false);
    expect(storage.error()).toBe('Nepavyko prisijungti prie duomenų saugyklos.');
  });
});

function createNote(): Note {
  return {
    id: 'note-1',
    title: 'Išsaugotas užrašas',
    text: 'Tekstas iš API',
    createdAt: '2026-10-04T10:00:00.000Z',
  };
}

import { TestBed } from '@angular/core/testing';
import { NOTES_STORAGE_KEY, NotesStorage } from './notes-storage';

describe('NotesStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('stores a new note in localStorage', () => {
    const storage = TestBed.inject(NotesStorage);

    storage.add({ title: 'Pirmas užrašas', text: 'Svarbus tekstas' });

    expect(storage.notes()).toHaveLength(1);
    expect(storage.notes()[0]).toMatchObject({
      title: 'Pirmas užrašas',
      text: 'Svarbus tekstas',
    });
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '[]')).toHaveLength(1);
  });

  it('loads previously stored notes', () => {
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'note-1',
          title: 'Išsaugotas užrašas',
          text: 'Tekstas iš localStorage',
          createdAt: '2026-10-04T10:00:00.000Z',
        },
      ]),
    );

    const storage = TestBed.inject(NotesStorage);

    expect(storage.notes()).toHaveLength(1);
    expect(storage.notes()[0].title).toBe('Išsaugotas užrašas');
  });

  it('removes a note from memory and localStorage', () => {
    const storage = TestBed.inject(NotesStorage);
    storage.add({ title: 'Trinti', text: 'Šis užrašas bus pašalintas' });
    const id = storage.notes()[0].id;

    storage.remove(id);

    expect(storage.notes()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('ignores invalid stored data', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '{invalid json');

    const storage = TestBed.inject(NotesStorage);

    expect(storage.notes()).toEqual([]);
  });
});

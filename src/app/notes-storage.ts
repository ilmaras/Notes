import { Injectable, signal } from '@angular/core';
import type { Note, NoteDraft } from './note';

export const NOTES_STORAGE_KEY = 'notes-app.notes';

@Injectable({ providedIn: 'root' })
export class NotesStorage {
  // Vidinis signalas keiciamas tik sioje paslaugoje, o komponentams pateikiamas tik skaitymui.
  private readonly storedNotes = signal<Note[]>(this.load());

  readonly notes = this.storedNotes.asReadonly();

  add(draft: NoteDraft): void {
    const note: Note = {
      id: this.createId(),
      title: draft.title.trim(),
      text: draft.text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Naujas uzrasas iterpiamas saraso pradzioje.
    this.update([note, ...this.storedNotes()]);
  }

  remove(id: string): void {
    this.update(this.storedNotes().filter((note) => note.id !== id));
  }

  private update(notes: Note[]): void {
    this.storedNotes.set(notes);

    try {
      globalThis.localStorage?.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Programa veikia toliau, kai saugykla nepasiekiama arba uzpildyta.
    }
  }

  private load(): Note[] {
    try {
      const value = globalThis.localStorage?.getItem(NOTES_STORAGE_KEY);
      if (!value) {
        return [];
      }

      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(isNote) : [];
    } catch {
      return [];
    }
  }

  private createId(): string {
    // Jei UUID funkcija nepasiekiama, naudojamas laiko ir atsitiktinio skaiciaus derinys.
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}

// Patikrinama, ar is localStorage nuskaitytas objektas atitinka Note struktura.
function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const note = value as Partial<Note>;
  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.text === 'string' &&
    typeof note.createdAt === 'string'
  );
}

import { Component, inject, signal, viewChild } from '@angular/core';
import type { Note, NoteDraft } from './note';
import { NoteForm } from './note-form/note-form';
import { NoteList } from './note-list/note-list';
import { NotesStorage } from './notes-storage';

@Component({
  selector: 'app-root',
  imports: [NoteForm, NoteList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly notesStorage = inject(NotesStorage);
  private readonly noteForm = viewChild(NoteForm);

  readonly notes = this.notesStorage.notes;
  readonly loading = this.notesStorage.loading;
  readonly error = this.notesStorage.error;
  readonly editingNote = signal<Note | null>(null);

  async saveNote(draft: NoteDraft): Promise<void> {
    const note = this.editingNote();

    if (note) {
      if (await this.notesStorage.update(note.id, draft)) {
        this.editingNote.set(null);
      }
    } else if (await this.notesStorage.add(draft)) {
      this.noteForm()?.reset();
    }
  }

  editNote(note: Note): void {
    this.editingNote.set(note);
  }

  cancelEdit(): void {
    this.editingNote.set(null);
  }

  dismissError(): void {
    this.notesStorage.clearError();
  }

  async deleteNote(id: string): Promise<void> {
    if (await this.notesStorage.remove(id)) {
      if (this.editingNote()?.id === id) {
        this.editingNote.set(null);
      }
    }
  }
}

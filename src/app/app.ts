import { Component, inject, viewChild } from '@angular/core';
import type { NoteDraft } from './note';
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

  async addNote(draft: NoteDraft): Promise<void> {
    if (await this.notesStorage.add(draft)) {
      this.noteForm()?.reset();
    }
  }

  deleteNote(id: string): void {
    this.notesStorage.remove(id);
  }
}

import { Component, inject } from '@angular/core';
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

  readonly notes = this.notesStorage.notes;

  addNote(draft: NoteDraft): void {
    this.notesStorage.add(draft);
  }

  deleteNote(id: string): void {
    this.notesStorage.remove(id);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Note, NoteDraft } from './note';

@Injectable({ providedIn: 'root' })
export class NotesStorage {
  private readonly http = inject(HttpClient);
  private readonly storedNotes = signal<Note[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);

  readonly notes = this.storedNotes.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  constructor() {
    this.load();
  }

  async add(draft: NoteDraft): Promise<boolean> {
    this.errorState.set(null);

    try {
      const note = await firstValueFrom(this.http.post<Note>('/api/notes', draft));
      this.storedNotes.update((notes) => [note, ...notes]);
      return true;
    } catch {
      this.showConnectionError();
      return false;
    }
  }

  remove(id: string): void {
    this.errorState.set(null);
    this.http.delete<void>(`/api/notes/${encodeURIComponent(id)}`).subscribe({
      next: () => this.storedNotes.update((notes) => notes.filter((note) => note.id !== id)),
      error: () => this.showConnectionError(),
    });
  }

  private load(): void {
    this.http.get<Note[]>('/api/notes').subscribe({
      next: (notes) => {
        this.storedNotes.set(notes);
        this.loadingState.set(false);
      },
      error: () => {
        this.loadingState.set(false);
        this.showConnectionError();
      },
    });
  }

  private showConnectionError(): void {
    this.errorState.set('Nepavyko prisijungti prie duomenų saugyklos.');
  }
}

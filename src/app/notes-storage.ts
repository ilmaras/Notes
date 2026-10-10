import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    } catch (error) {
      this.showRequestError(
        error,
        'Nepavyko sukurti įrašo.',
        'Nepavyko sukurti įrašo. Patikrinkite formos laukus.',
      );
      return false;
    }
  }

  async update(id: string, draft: NoteDraft): Promise<boolean> {
    this.errorState.set(null);

    try {
      const updatedNote = await firstValueFrom(
        this.http.patch<Note>(`/api/notes/${encodeURIComponent(id)}`, draft),
      );
      this.storedNotes.update((notes) =>
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      return true;
    } catch (error) {
      this.showRequestError(
        error,
        'Nepavyko atnaujinti įrašo.',
        'Nepavyko atnaujinti įrašo. Patikrinkite formos laukus.',
        'Redaguojamas įrašas neberastas.',
      );
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    this.errorState.set(null);

    try {
      await firstValueFrom(this.http.delete<void>(`/api/notes/${encodeURIComponent(id)}`));
      this.storedNotes.update((notes) => notes.filter((note) => note.id !== id));
      return true;
    } catch (error) {
      this.showRequestError(
        error,
        'Nepavyko ištrinti įrašo.',
        undefined,
        'Trinamas įrašas neberastas.',
      );
      return false;
    }
  }

  clearError(): void {
    this.errorState.set(null);
  }

  private load(): void {
    this.http.get<Note[]>('/api/notes').subscribe({
      next: (notes) => {
        this.storedNotes.set(notes);
        this.loadingState.set(false);
      },
      error: (error) => {
        this.loadingState.set(false);
        this.showRequestError(error, 'Nepavyko įkelti užrašų.');
      },
    });
  }

  private showRequestError(
    error: unknown,
    fallback: string,
    badRequest?: string,
    notFound?: string,
  ): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.errorState.set(fallback);
      return;
    }

    if (error.status === 0) {
      this.errorState.set('Nepavyko prisijungti prie duomenų saugyklos.');
    } else if (error.status === 404 && notFound) {
      this.errorState.set(notFound);
    } else if (error.status === 400) {
      this.errorState.set(badRequest ?? fallback);
    } else if (error.status >= 500) {
      this.errorState.set(`${fallback} Duomenų saugyklos klaida.`);
    } else {
      this.errorState.set(fallback);
    }
  }
}

import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Note, NoteDraft } from '../note';

@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule],
  templateUrl: './note-form.html',
  styleUrl: './note-form.css',
})
export class NoteForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly editingNote = input<Note | null>(null);
  readonly noteSubmitted = output<NoteDraft>();
  readonly editCancelled = output<void>();
  readonly noteForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    text: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      const note = this.editingNote();
      if (note) {
        this.noteForm.setValue({ title: note.title, text: note.text });
      } else {
        this.reset();
      }
    });
  }

  submit(): void {
    // Pasalinami tarpai, kad vien is tarpu sudaryta reiksme nebutu laikoma galiojancia.
    const title = this.noteForm.controls.title.value.trim();
    const text = this.noteForm.controls.text.value.trim();

    if (!title) {
      this.noteForm.controls.title.setErrors({ required: true });
    }
    if (!text) {
      this.noteForm.controls.text.setErrors({ required: true });
    }

    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    this.noteSubmitted.emit({ title, text });
  }

  reset(): void {
    this.noteForm.reset();
  }

  cancelEdit(): void {
    this.editCancelled.emit();
  }
}

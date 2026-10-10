import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { Note } from '../note';

@Component({
  selector: 'app-note-list',
  imports: [DatePipe],
  templateUrl: './note-list.html',
  styleUrl: './note-list.css',
})
export class NoteList {
  readonly notes = input.required<readonly Note[]>();
  readonly editRequested = output<Note>();
  readonly deleteRequested = output<string>();
}

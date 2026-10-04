export interface Note {
  id: string;
  title: string;
  text: string;
  createdAt: string;
}

// Formos duomenys be programos sugeneruojamu id ir datos lauku.
export type NoteDraft = Pick<Note, 'title' | 'text'>;

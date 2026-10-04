import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createNotesDatabase } from './sqlite.mjs';

describe('SQLite uzrasu saugykla', () => {
  let notesDatabase;

  beforeEach(() => {
    notesDatabase = createNotesDatabase(':memory:');
  });

  afterEach(() => {
    notesDatabase.close();
  });

  it('sukuria ir nuskaito uzrasa', () => {
    const note = notesDatabase.create({ title: 'Pirmas uzrasas', text: 'Svarbus tekstas' });

    assert.deepEqual(notesDatabase.getAll(), [note]);
  });

  it('istrina uzrasa pagal id', () => {
    const note = notesDatabase.create({ title: 'Trinti', text: 'Trumpas tekstas' });

    assert.equal(notesDatabase.remove(note.id), true);
    assert.deepEqual(notesDatabase.getAll(), []);
  });

  it('pranesa, kai trinamo uzraso nera', () => {
    assert.equal(notesDatabase.remove('nera-tokio-id'), false);
  });
});

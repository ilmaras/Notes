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

  it('atnaujina uzrasa nekeisdamas id ir datos', () => {
    const note = notesDatabase.create({ title: 'Senas', text: 'Senas tekstas' });
    const updated = notesDatabase.update(note.id, { title: 'Naujas', text: 'Naujas tekstas' });

    assert.deepEqual(updated, { ...note, title: 'Naujas', text: 'Naujas tekstas' });
    assert.deepEqual(notesDatabase.getAll(), [updated]);
  });

  it('pranesa, kai atnaujinamo uzraso nera', () => {
    assert.equal(
      notesDatabase.update('nera-tokio-id', { title: 'Naujas', text: 'Naujas tekstas' }),
      null,
    );
  });

  it('pranesa, kai trinamo uzraso nera', () => {
    assert.equal(notesDatabase.remove('nera-tokio-id'), false);
  });
});

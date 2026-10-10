import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export function createNotesDatabase(path) {
  const database = new DatabaseSync(path);

  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT
  `);

  const selectAll = database.prepare(`
    SELECT id, title, text, created_at AS createdAt
    FROM notes
    ORDER BY created_at DESC
  `);
  const insertOne = database.prepare(`
    INSERT INTO notes (id, title, text, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const updateOne = database.prepare(`
    UPDATE notes
    SET title = ?, text = ?
    WHERE id = ?
    RETURNING id, title, text, created_at AS createdAt
  `);
  const deleteOne = database.prepare('DELETE FROM notes WHERE id = ?');

  return {
    getAll() {
      return selectAll.all().map((note) => ({ ...note }));
    },

    create({ title, text }) {
      const note = {
        id: randomUUID(),
        title,
        text,
        createdAt: new Date().toISOString(),
      };

      insertOne.run(note.id, note.title, note.text, note.createdAt);
      return note;
    },

    update(id, { title, text }) {
      const note = updateOne.get(title, text, id);
      return note ? { ...note } : null;
    },

    remove(id) {
      return deleteOne.run(id).changes > 0;
    },

    close() {
      database.close();
    },
  };
}

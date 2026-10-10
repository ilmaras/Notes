import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createNotesApi } from './api.mjs';
import { createNotesDatabase } from './sqlite.mjs';

describe('Uzrasu API', () => {
  let notesDatabase;
  let server;
  let apiUrl;

  beforeEach(async () => {
    notesDatabase = createNotesDatabase(':memory:');
    server = createNotesApi(notesDatabase);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    const address = server.address();
    apiUrl = `http://127.0.0.1:${address.port}/api/notes`;
  });

  afterEach(() => {
    server.close();
    server.closeAllConnections();
    notesDatabase.close();
  });

  it('sukuria, nuskaito, atnaujina ir istrina uzrasa', async () => {
    const createResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'API uzrasas', text: 'Tekstas is API' }),
    });
    const createdNote = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createdNote.title, 'API uzrasas');

    const listResponse = await fetch(apiUrl);
    assert.deepEqual(await listResponse.json(), [createdNote]);

    const updateResponse = await fetch(`${apiUrl}/${createdNote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Atnaujintas', text: 'Pakeistas tekstas' }),
    });
    const updatedNote = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.deepEqual(updatedNote, {
      ...createdNote,
      title: 'Atnaujintas',
      text: 'Pakeistas tekstas',
    });

    const deleteResponse = await fetch(`${apiUrl}/${createdNote.id}`, { method: 'DELETE' });
    assert.equal(deleteResponse.status, 204);
    assert.deepEqual(await (await fetch(apiUrl)).json(), []);
  });

  it('atmeta tuscius duomenis', async () => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ', text: '' }),
    });

    assert.equal(response.status, 400);
  });

  it('grazina 404, kai atnaujinamo uzraso nera', async () => {
    const response = await fetch(`${apiUrl}/nera-tokio-id`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Naujas', text: 'Naujas tekstas' }),
    });

    assert.equal(response.status, 404);
  });

  it('atskiria neteisinga JSON nuo vidines serverio klaidos', async () => {
    const invalidJsonResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    assert.equal(invalidJsonResponse.status, 400);

    notesDatabase.getAll = () => {
      throw new Error('SQLite klaida');
    };
    const serverErrorResponse = await fetch(apiUrl);
    assert.equal(serverErrorResponse.status, 500);
  });
});

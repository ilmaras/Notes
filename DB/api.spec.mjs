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

  it('sukuria, nuskaito ir istrina uzrasa', async () => {
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
});

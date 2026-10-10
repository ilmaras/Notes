import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { createNotesDatabase } from './sqlite.mjs';

const HOST = '127.0.0.1';
const PORT = 3000;

export function createNotesApi(notesDatabase) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? HOST}`);

      if (request.method === 'GET' && url.pathname === '/api/notes') {
        sendJson(response, 200, notesDatabase.getAll());
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/notes') {
        const draft = validateDraft(await readJson(request));
        if (!draft) {
          sendJson(response, 400, { error: 'Neteisingi uzraso duomenys.' });
          return;
        }

        sendJson(response, 201, notesDatabase.create(draft));
        return;
      }

      if (request.method === 'PATCH' && url.pathname.startsWith('/api/notes/')) {
        const id = decodeURIComponent(url.pathname.slice('/api/notes/'.length));
        const draft = validateDraft(await readJson(request));
        if (!id || !draft) {
          sendJson(response, 400, { error: 'Neteisingi uzraso duomenys.' });
          return;
        }

        const note = notesDatabase.update(id, draft);
        if (!note) {
          sendJson(response, 404, { error: 'Uzrasas nerastas.' });
          return;
        }

        sendJson(response, 200, note);
        return;
      }

      if (request.method === 'DELETE' && url.pathname.startsWith('/api/notes/')) {
        const id = decodeURIComponent(url.pathname.slice('/api/notes/'.length));
        if (!id || !notesDatabase.remove(id)) {
          sendJson(response, 404, { error: 'Uzrasas nerastas.' });
          return;
        }

        response.writeHead(204).end();
        return;
      }

      sendJson(response, 404, { error: 'Kelias nerastas.' });
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof URIError) {
        sendJson(response, 400, { error: 'Nepavyko apdoroti uzklausos.' });
      } else {
        sendJson(response, 500, { error: 'Vidine serverio klaida.' });
      }
    }
  });
}

function validateDraft(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const text = typeof value.text === 'string' ? value.text.trim() : '';

  if (!title || !text || title.length > 80 || text.length > 2000) {
    return null;
  }

  return { title, text };
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
  }

  return JSON.parse(body);
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const notesDatabase = createNotesDatabase(new URL('./data/notes.db', import.meta.url));
  const server = createNotesApi(notesDatabase);

  server.listen(PORT, HOST, () => {
    console.log(`Notes API veikia adresu http://${HOST}:${PORT}`);
  });

  process.on('SIGINT', () => {
    server.close(() => {
      notesDatabase.close();
      process.exit(0);
    });
  });
}

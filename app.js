import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => {
  return c.html('<h1>Hello, World!</h1>');
});

app.get('/json', (c) => {
  return c.json({ firstName: 'Franta', lastName: 'Sádlo' });
});

app.get('/hello/:name', (c) => {
  const name = c.req.param('name');

  return c.html(`<h1>Hello, ${name}!</h1>`);
});

app.use((c) => {
  console.log(`Not found: ${c.req.path}`);
  return c.notFound();
});

serve(app, (info) => {
  console.log(`Server listening at http://localhost:${info.port}`);
});

const express = require('express');

const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const repositories = [];

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = repositories.find((repo) => repo.id === id);

  if (!repository) {
    return response.status(404).json({ error: 'not found' });
  }

  return response.status(201).json({
    ...repository,
    title,
    url,
    techs,
  });
});

app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params;

  const repository = repositories.find((repo) => repo.id === id);

  if (!repository) {
    return response.status(404).json({ error: 'not found' });
  }

  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);

  repositories.splice(repositoryIndex, 1);
  return response.status(204).json();
});

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;

  const repository = repositories.find((repo) => repo.id === id);

  if (!repository) {
    return response.status(404).json({ error: 'not found' });
  }

  repository.likes += 1;

  return response.status(201).json(repository);
});

module.exports = app;

const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found!" });

  request.user = user;

  return next();
}

function checkHasTodo(request, response, next) {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const todo = user.todos.some((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found!" });

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) =>
  response.json(request.user.todos)
);

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkHasTodo,
  (request, response) => {
    const {
      user: { todos },
      params: { id },
      body: { title, deadline },
    } = request;

    const todo = todos.find((todo) => todo.id === id);
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkHasTodo,
  (request, response) => {
    const {
      user: { todos },
      params: { id },
    } = request;

    const todo = todos.find((todo) => todo.id === id);
    todo.done = true;

    return response.status(201).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkHasTodo,
  (request, response) => {
    const {
      user: { todos },
      params: { id },
    } = request;

    const todoIndex = todos.findIndex((todo) => todo.id === id);

    todos.splice(todoIndex, 1);
    return response.status(204).json();
  }
);

module.exports = app;

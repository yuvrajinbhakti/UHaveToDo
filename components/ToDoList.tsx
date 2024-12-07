import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

interface Todo {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  // Fetch todos
  const fetchTodos = async () => {
    const response = await fetch("/api/todos");
    const data = await response.json();
    setTodos(data.data);
  };

  // Add todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTodo,
        completed: false,
      }),
    });

    const newTodoItem = await response.json();
    setTodos([newTodoItem.data, ...todos]);
    setNewTodo("");
  };

  // Toggle todo completion
  const toggleTodo = async (todo: Todo) => {
    // Placeholder for update logic
    console.log("Toggle todo", todo);
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    // Placeholder for delete logic
    console.log("Delete todo", todoId);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow p-2 border rounded-l-md"
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white p-2 rounded-r-md"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex items-center justify-between p-2 border-b"
          >
            <span
              className={`flex-grow ${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.title}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleTodo(todo)}
                className="text-green-500"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => deleteTodo(todo._id!)}
                className="text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;

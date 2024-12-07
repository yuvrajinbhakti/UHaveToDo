import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  CalendarIcon,
  FlagIcon,
} from "@heroicons/react/24/solid";

interface Todo {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  tags?: string[];
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();
      setTodos(data.data);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    }
  };

  // Add todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodo,
          description: description,
          completed: false,
          priority: priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const newTodoItem = await response.json();
      setTodos([newTodoItem.data, ...todos]);

      // Reset form
      setNewTodo("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setTags("");
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos?id=${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t._id === todo._id ? updatedTodo.data : t)));
    } catch (error) {
      console.error("Failed to toggle todo", error);
    }
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    try {
      await fetch(`/api/todos?id=${todoId}`, { method: "DELETE" });
      setTodos(todos.filter((todo) => todo._id !== todoId));
    } catch (error) {
      console.error("Failed to delete todo", error);
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority: Todo["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {/* Todo Input Form */}
      <div className="space-y-4 mb-6">
        <div className="flex">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Todo title"
            className="flex-grow p-2 border rounded-l-md"
            required
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 text-white p-2 rounded-r-md"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Additional Todo Details */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full p-2 border rounded"
        />

        <div className="flex space-x-2">
          {/* Priority Selector */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Todo["priority"])}
            className="flex-grow p-2 border rounded"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          {/* Due Date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        {/* Tags Input */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Todo List */}
      <ul>
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex items-center justify-between p-2 border-b"
          >
            <div className="flex-grow">
              <div className="flex items-center">
                <span
                  className={`flex-grow ${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.title}
                </span>
                <FlagIcon
                  className={`h-4 w-4 mr-2 ${getPriorityColor(todo.priority)}`}
                  title={`${todo.priority} priority`}
                />
              </div>
              {todo.description && (
                <p className="text-sm text-gray-500">{todo.description}</p>
              )}
              {todo.dueDate && (
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(todo.dueDate).toLocaleDateString()}
                </div>
              )}
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {todo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleTodo(todo)}
                className="text-green-500"
                title={
                  todo.completed ? "Mark as Incomplete" : "Mark as Complete"
                }
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => deleteTodo(todo._id!)}
                className="text-red-500"
                title="Delete Todo"
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

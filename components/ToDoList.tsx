import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  CalendarIcon,
  FlagIcon,
  PencilIcon,
  XMarkIcon,
  CloudIcon,
} from "@heroicons/react/24/solid";

interface Todo {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  tags?: string[];
  googleCalendarEventId?: string;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] =
    useState<boolean>(false);

  // State for editing existing todos
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Google Calendar Authentication
  const handleGoogleCalendarAuth = async () => {
    try {
      // This would typically involve redirecting to Google's OAuth consent screen
      const response = await fetch("/api/google-calendar/auth");
      const authData = await response.json();

      // Store tokens securely (typically in httpOnly cookie or secure storage)
      localStorage.setItem("google_calendar_token", authData.token);
      setIsGoogleCalendarConnected(true);
    } catch (error) {
      console.error("Google Calendar authentication failed", error);
      alert("Failed to connect to Google Calendar");
    }
  };

  // Sync todo to Google Calendar
  const syncToGoogleCalendar = async (todo: Todo) => {
    if (!isGoogleCalendarConnected) {
      alert("Please connect to Google Calendar first");
      return;
    }

    try {
      const response = await fetch("/api/google-calendar/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "google_calendar_token"
          )}`,
        },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority,
        }),
      });

      const syncedEvent = await response.json();

      // Update todo with Google Calendar event ID
      const updatedTodo = {
        ...todo,
        googleCalendarEventId: syncedEvent.id,
      };

      // Update local state
      setTodos(todos.map((t) => (t._id === todo._id ? updatedTodo : t)));

      alert("Todo synced to Google Calendar!");
    } catch (error) {
      console.error("Failed to sync to Google Calendar", error);
      alert("Failed to sync todo to Google Calendar");
    }
  };

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

  // Update todo
  const updateTodo = async () => {
    if (!editingTodo) return;

    try {
      const response = await fetch(`/api/todos?id=${editingTodo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodo,
          description: description,
          priority: priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const updatedTodoItem = await response.json();
      setTodos(
        todos.map((todo) =>
          todo._id === editingTodo._id ? updatedTodoItem.data : todo
        )
      );

      // Reset edit state and form
      setEditingTodo(null);
      setNewTodo("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setTags("");
    } catch (error) {
      console.error("Failed to update todo", error);
    }
  };

  // Start editing a todo
  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodo(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority);
    setDueDate(
      todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
    );
    setTags(todo.tags?.join(", ") || "");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTodo(null);
    setNewTodo("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setTags("");
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
            onClick={editingTodo ? updateTodo : addTodo}
            className="bg-blue-500 text-white p-2 rounded-r-md"
          >
            {editingTodo ? "Update" : <PlusIcon className="h-6 w-6" />}
          </button>
          {editingTodo && (
            <button
              onClick={cancelEdit}
              className="bg-red-500 text-white p-2 ml-2 rounded"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
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

        <div className="mb-4">
          <button
            onClick={handleGoogleCalendarAuth}
            className={`flex items-center p-2 rounded ${
              isGoogleCalendarConnected
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <CloudIcon className="h-5 w-5 mr-2" />
            {isGoogleCalendarConnected
              ? "Google Calendar Connected"
              : "Connect to Google Calendar"}
          </button>
        </div>
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
                onClick={() => startEditTodo(todo)}
                className="text-blue-500"
                title="Edit Todo"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
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
              <button
                onClick={() => syncToGoogleCalendar(todo)}
                className="text-purple-500"
                title="Sync to Google Calendar"
                disabled={!isGoogleCalendarConnected}
              >
                <CloudIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;

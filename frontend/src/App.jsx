import { useState, useEffect } from "react";
import API from "./api";

export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");

  const [filter, setFilter] = useState("all");

  // 🔐 LOGIN
  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill all fields ❗");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 SIGNUP
  const handleSignup = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill all fields ❗");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/auth/signup", {
        name: "Test User",
        email: form.email,
        password: form.password,
        role: "admin",
      });

      alert("Signup successful ✅");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch tasks
  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data.data || []);
  };

  // 👤 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
      fetchUsers();
    }
  }, [isLoggedIn]);

  // ➕ Create task
  const createTask = async () => {
    if (!title.trim()) return;

    await API.post("/tasks", {
      title,
      status: "todo",
      assignedTo,
    });

    setTitle("");
    setAssignedTo("");
    fetchTasks();
  };

  // ❌ DELETE TASK
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ UPDATE + AUTO DELETE
  const updateStatus = async (id) => {
    try {
      await API.put(`/tasks/${id}`, { status: "done" });

      // 🔥 auto delete
      await API.delete(`/tasks/${id}`);

      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // 📊 Stats
  const total = tasks?.length || 0;
  const completed = tasks?.filter((t) => t.status === "done").length || 0;
  const pending = tasks?.filter((t) => t.status !== "done").length || 0;

  // 🔍 Filter
  const filteredTasks =
    tasks?.filter((t) => {
      if (filter === "all") return true;
      return t.status === filter;
    }) || [];

  // 🔁 LOGIN UI
  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold text-center mb-6">
            Team Task Manager
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-3 border rounded-lg"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-3 border rounded-lg"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-lg mb-2"
          >
            {loading ? "Processing..." : "Login"}
          </button>

          <button
            onClick={handleSignup}
            className="w-full bg-green-500 text-white py-3 rounded-lg"
          >
            Signup
          </button>
        </div>
      </div>
    );
  }

  // 📊 DASHBOARD UI
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h3>Total</h3>
          <p className="text-xl font-bold">{total}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3>Completed</h3>
          <p className="text-xl font-bold text-green-500">{completed}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3>Pending</h3>
          <p className="text-xl font-bold text-red-500">{pending}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <button onClick={() => setFilter("all")} className="mr-2">
          All
        </button>
        <button onClick={() => setFilter("todo")} className="mr-2">
          Todo
        </button>
        <button onClick={() => setFilter("done")}>Done</button>
      </div>

      {/* Create Task */}
      <div className="mb-4 flex gap-2">
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Assign User</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task"
          className="border p-2 rounded w-full"
        />

        <button
          onClick={createTask}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="grid gap-3">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white p-3 rounded shadow">
            <h2 className="font-semibold">{task.title}</h2>

            <p>Status: {task.status}</p>

            <p>Assigned: {task.assignedTo?.name || "Unassigned"}</p>

            <div className="flex gap-2 mt-2">
              {task.status !== "done" && (
                <button
                  onClick={() => updateStatus(task._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Done
                </button>
              )}

              <button
                onClick={() => deleteTask(task._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

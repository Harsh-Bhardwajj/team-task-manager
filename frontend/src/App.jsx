import { useState, useEffect } from "react";
import API from "./api";

export default function App() {
  const [isLoginView, setIsLoginView] = useState(true); // Toggle between Login/Signup
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) setIsLoggedIn(true);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? "/auth/login" : "/auth/signup"; // Fix here
    try {
      const res = await API.post(endpoint, form);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setIsLoggedIn(true);
      } else if (!isLoginView) {
        alert("Signup Successful! Ab login kijiye.");
        setIsLoginView(true); // Signup ke baad login screen pe bhej dega
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Authentication failed!");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.role === "admin") fetchUsers();
    }
  }, [isLoggedIn]);
  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);

    fetchTasks();
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setTasks([]);
  };

  // Styles Object
  const styles = {
    container: {
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f4f7f6",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      backgroundColor: "#fff",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    link: {
      color: "#007bff",
      cursor: "pointer",
      marginTop: "15px",
      display: "inline-block",
    },
    dashboard: {
      padding: "20px",
      maxWidth: "900px",
      margin: "0 auto",
      width: "100%",
    },
    taskItem: {
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: "20px" }}>
            {isLoginView ? "Welcome Back" : "Create Account"}
          </h2>
          <form onSubmit={handleAuth}>
            {!isLoginView && (
              <input
                type="text"
                placeholder="Full Name"
                required
                style={styles.input}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              required
              style={styles.input}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={styles.input}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" style={styles.button}>
              {isLoginView ? "Login" : "Sign Up"}
            </button>
          </form>
          <span
            style={styles.link}
            onClick={() => setIsLoginView(!isLoginView)}
          >
            {isLoginView
              ? "New here? Create an account"
              : "Already have an account? Login"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <div style={styles.dashboard}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1>Team Manager</h1>
          <button
            onClick={logout}
            style={{
              ...styles.button,
              width: "auto",
              backgroundColor: "#dc3545",
            }}
          >
            Logout
          </button>
        </header>

        <section
          style={{
            ...styles.card,
            maxWidth: "none",
            textAlign: "left",
            marginBottom: "30px",
          }}
        >
          <h3>Assign New Task</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              placeholder="What needs to be done?"
              style={{ ...styles.input, flex: 2, marginBottom: 0 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              style={{ ...styles.input, flex: 1, marginBottom: 0 }}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Assign To</option>
              {users?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                if (!title) return alert("Title is required");
                const user = JSON.parse(localStorage.getItem("user"));
                await API.post("/tasks", {
                  title,
                  assignedTo: assignedTo || user.id,
                });
                setTitle("");
                fetchTasks();
              }}
              style={{ ...styles.button, width: "auto" }}
            >
              Add
            </button>
          </div>
        </section>

        <section>
          <h3>Active Tasks</h3>
          {tasks.length > 0 ? (
            tasks.map((t) => (
              <div key={t._id} style={styles.taskItem}>
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>{t.title}</strong>
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    Status: {t.status}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await API.delete(`/tasks/${t._id}`);
                    fetchTasks();
                  }}
                  style={{
                    ...styles.button,
                    width: "auto",
                    backgroundColor: "#ffc107",
                    color: "#000",
                  }}
                >
                  Done
                </button>
              </div>
            ))
          ) : (
            <p>All clear! No tasks found.</p>
          )}
        </section>
      </div>
    </div>
  );
}

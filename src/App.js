import { useState, useEffect } from 'react';
import './App.css';

const API_URL = '';

function App() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'ERROR', message: err.message });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createUser = async () => {
    if (!name || !email) return;
    try {
      await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchUsers();
  }, []);

  const isHealthy = health && health.status !== 'ERROR';

  return (
    <div className="App">
      <div className="header">
        <img src="/favicon.svg" alt="DAMO" />
        <h1>DAMO</h1>
      </div>

      <div className="card">
        <h2>Server Status</h2>
        {health ? (
          <>
            <div className="health-status">
              <div className={`health-dot ${isHealthy ? '' : 'error'}`} />
              <span>{isHealthy ? 'Connected' : 'Disconnected'}</span>
            </div>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="card">
        <h2>Add User</h2>
        <div className="form-row">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={createUser}>Create</button>
        </div>
      </div>

      <div className="card">
        <h2>Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="empty-state">No users yet.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="delete-btn" onClick={() => deleteUser(user.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;

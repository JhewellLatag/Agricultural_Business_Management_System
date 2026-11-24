import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Gulayan Staff');
  const [department, setDepartment] = useState('Gulayan');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') setDepartment('All');
    if (selectedRole === 'Gulayan Staff') setDepartment('Gulayan');
    if (selectedRole === 'Prutasan Staff') setDepartment('Prutasan');
    if (selectedRole === 'Babuyan Staff') setDepartment('Babuyan');
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setFullName('');
    setUsername('');
    setPassword('');
    setRole('Gulayan Staff');
    setDepartment('Gulayan');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editId) {
        await api.put(/admin/users/${editId}, {
          full_name: fullName,
          username,
          department,
          role,
          password: password || undefined,
        });
        setMessage('User account updated.');
      } else {
        await api.post('/admin/users', {
          full_name: fullName,
          username,
          password,
          department,
          role,
        });
        setMessage('User account created.');
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleEdit = (u) => {
    setError('');
    setMessage('');
    setEditId(u.id);
    setFullName(u.full_name || '');
    setUsername(u.username || '');
    setPassword('');
    setRole(u.role || 'Gulayan Staff');
    setDepartment(u.department || 'Gulayan');
  };

  const handleToggleStatus = async (u) => {
    setError('');
    setMessage('');
    const newStatus = u.status === 'active' ? 'deactivated' : 'active';
    try {
      await api.patch(/admin/users/${u.id}/status, { status: newStatus });
      setMessage(User account ${newStatus}.);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  return (
    <div>
      <h2>Admin - User Account &amp; Role-Based Access Management</h2>

      {message && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px', marginBottom: '12px' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <h3>{editId ? 'Edit User Account' : 'Create New User Account'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>{editId ? 'New Password (leave blank to keep current):' : 'Password:'}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editId}
          />
        </div>

        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="Admin">Administrator</option>
            <option value="Gulayan Staff">Gulayan Staff</option>
            <option value="Prutasan Staff">Prutasan Staff</option>
            <option value="Babuyan Staff">Babuyan Staff</option>
          </select>
        </div>

        <div>
          <label>Assigned Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="All">All Departments (Admin)</option>
            <option value="Gulayan">Gulayan</option>
            <option value="Prutasan">Prutasan</option>
            <option value="Babuyan">Babuyan</option>
          </select>
        </div>

        <button type="submit">{editId ? 'Save Changes' : 'Create Account'}</button>
        {editId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '8px' }}>
            Cancel
          </button>
        )}
      </form>

      <h3>Registered User Accounts</h3>
      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Username</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const statusText = u.status || 'active';
            return (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.username}</td>
                <td>{u.department}</td>
                <td>{u.role}</td>
                <td>
                  <strong style={{ color: statusText === 'active' ? 'green' : 'red' }}>
                    {statusText.toUpperCase()}
                  </strong>
                </td>
                <td>
                  <button type="button" onClick={() => handleEdit(u)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    style={{ marginLeft: '8px' }}
                  >
                    {statusText === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;
// src/components/Todo.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import config from './config.js';

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState({ id: '', title: '', description: '', completed: false });
  const [idToFetch, setIdToFetch] = useState('');
  const [fetchedTodo, setFetchedTodo] = useState(null);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const baseUrl = (config && config.url) ? `${config.url}/todoapi` : '/api/todoapi';

  useEffect(() => {
    (async () => { try { await fetchAllTodos(); } catch (e) { console.error(e); } })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllTodos = async () => {
    try {
      const res = await axios.get(`${baseUrl}/all`);
      setTodos(res.data || []);
      setMessage('');
    } catch (error) {
      console.error('fetchAllTodos error', error);
      setMessage('Failed to fetch todos.');
    }
  };

  // Handle controlled inputs (ID allowed)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTodo(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    if (!todo.title || todo.title.toString().trim() === '') {
      setMessage('Please fill out the title field.');
      return false;
    }
    return true;
  };

  const addTodo = async () => {
    if (!validateForm()) return;
    try {
      // include id if user provided it (server may ignore or validate)
      const payload = { title: todo.title, description: todo.description, completed: todo.completed };
      if (todo.id !== '' && todo.id !== null) payload.id = todo.id;
      await axios.post(`${baseUrl}/add`, payload);
      setMessage('Todo added successfully.');
      await fetchAllTodos();
      resetForm();
    } catch (error) {
      console.error('addTodo error', error);
      setMessage('Error adding todo.');
    }
  };

  const updateTodo = async () => {
    if (!validateForm()) return;
    try {
      await axios.put(`${baseUrl}/update`, todo);
      setMessage('Todo updated successfully.');
      await fetchAllTodos();
      resetForm();
    } catch (error) {
      console.error('updateTodo error', error);
      setMessage('Error updating todo.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await axios.delete(`${baseUrl}/delete/${id}`);
      setMessage(res?.data || 'Todo deleted.');
      await fetchAllTodos();
    } catch (error) {
      console.error('deleteTodo error', error);
      setMessage('Error deleting todo.');
    }
  };

  const getTodoById = async () => {
    if (!idToFetch) { setMessage('Please enter an ID to fetch.'); return; }
    try {
      const res = await axios.get(`${baseUrl}/get/${idToFetch}`);
      setFetchedTodo(res.data);
      setMessage('');
    } catch (error) {
      console.error('getTodoById error', error);
      setFetchedTodo(null);
      setMessage('Todo not found.');
    }
  };

  const handleEdit = (t) => {
    setTodo({
      id: t?.id ?? t?._id ?? '',
      title: t?.title ?? '',
      description: t?.description ?? '',
      completed: !!t?.completed
    });
    setEditMode(true);
    setMessage(`Editing todo with ID ${t?.id ?? t?._id ?? ''}`);
  };

  const resetForm = () => {
    setTodo({ id: '', title: '', description: '', completed: false });
    setEditMode(false);
    setMessage('');
  };

  return (
    <div className="todo-container">
      {message && (
        <div className={`message-banner ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <h2>Todo Manager</h2>

      <div>
        <h3>{editMode ? 'Edit Todo' : 'Add Todo'}</h3>

        <div className="form-grid">
          {/* ID is editable always */}
          <input
            type="text"
            inputMode="numeric"
            name="id"
            placeholder="ID (type or leave blank)"
            value={todo.id || ''}
            onChange={handleChange}
          />

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={todo.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={todo.description}
            onChange={handleChange}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="completed" checked={!!todo.completed} onChange={handleChange} />
            Completed
          </label>
        </div>

        <div className="btn-group">
          {!editMode ? (
            <button className="btn-blue" onClick={addTodo}>Add Todo</button>
          ) : (
            <>
              <button className="btn-green" onClick={updateTodo}>Update Todo</button>
              <button className="btn-gray" onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Get Todo By ID</h3>
        <input type="text" value={idToFetch} onChange={(e) => setIdToFetch(e.target.value)} placeholder="Enter ID" />
        <button className="btn-blue" onClick={getTodoById}>Fetch</button>

        {fetchedTodo && (
          <div style={{ marginTop: 12 }}>
            <h4>Todo Found:</h4>
            <pre>{JSON.stringify(fetchedTodo, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>All Todos</h3>
        {(!todos || todos.length === 0) ? (
          <p>No todos found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(todo).map((key) => (<th key={key}>{key}</th>))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.map((t) => {
                  const idVal = t.id ?? t._id ?? '';
                  return (
                    <tr key={idVal || Math.random()}>
                      {Object.keys(todo).map((key) => (
                        <td key={key}>
                          {key === 'completed' ? String(t[key]) : (t[key] ?? '')}
                        </td>
                      ))}
                      <td>
                        <div className="action-buttons">
                          <button className="btn-green" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn-red" onClick={() => deleteTodo(idVal)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Todo;

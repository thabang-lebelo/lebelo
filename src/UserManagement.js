import React, { useState, useEffect } from "react";
import bcrypt from 'bcryptjs';

const UserManagement = ({ onLogin, updateUserList, isAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState({ username: '', password: '' });
    const [isLoginForm, setIsLoginForm] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('http://localhost:5000/users') 
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    };

    const handleLogin = () => {
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }
    
        const loginData = { username, password };
    
        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid login credentials: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            onLogin(username); // Call the login function passed in props
        })
        .catch(error => {
            alert('Login failed: ' + error.message);
        });
    };

    const handleSignUp = () => {
        const userExists = users.some(user => user.username === signupUsername);
        if (userExists) {
            alert('Username already exists. Please choose another one.');
            return;
        }

        const newUser = { username: signupUsername, password: signupPassword }; // Send plain password
        fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            setSignupUsername('');
            setSignupPassword('');
            if (updateUserList) updateUserList();
            fetchUsers(); // Refresh users list
        })
        .catch(error => console.error('Error during signup:', error));
    };

    const handleDelete = (username) => {
        fetch(`http://localhost:5000/users/${username}`, {
            method: 'DELETE'
        })
        .then(() => {
            alert(`${username} has been deleted.`);
            fetchUsers(); // Refresh users list
        })
        .catch(error => console.error('Error deleting user:', error));
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        setEditUser(user);
    };

    const handleUpdate = () => {
        const updatedUser = { ...editUser };

        fetch(`http://localhost:5000/users/${editUser.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        })
        .then(() => {
            setIsEditing(false);
            alert('User updated successfully.');
            fetchUsers(); // Refresh users list
        })
        .catch(error => console.error('Error updating user:', error));
    };

    const toggleForm = () => {
        setIsLoginForm(!isLoginForm);
    };

    return (
        <section id="userManagement">
            {!isAuthenticated ? (
                <div id="loginSection">
                    {isLoginForm ? (
                        <>
                            <h3>Login</h3>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                            <button onClick={handleLogin}>Login</button>
                        </>
                    ) : (
                        <>
                            <h3>Sign Up</h3>
                            <input
                                type="text"
                                value={signupUsername}
                                onChange={e => setSignupUsername(e.target.value)}
                                placeholder="Username"
                                required
                            />
                            <input
                                type="password"
                                value={signupPassword}
                                onChange={e => setSignupPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                            <button onClick={handleSignUp}>Sign Up</button>
                        </>
                    )}
                    <button onClick={toggleForm}>
                        {isLoginForm ? "Switch to Sign Up" : "Switch to Login"}
                    </button>
                </div>
            ) : (
                <>
                    <hr />
                    <h3>Registered Users</h3>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ border: 'none' }}>Username</th>
                                <th style={{ border: 'none' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.username}>
                                    <td style={{ border: 'none' }}>{user.username}</td>
                                    <td style={{ border: 'none' }}>
                                        <button onClick={() => handleEdit(user)}>Update</button>
                                        <button onClick={() => handleDelete(user.username)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {isEditing && (
                        <div id="editForm">
                            <h3>Update User</h3>
                            <input 
                                type="text" 
                                value={editUser.username} 
                                readOnly 
                            />
                            <input 
                                type="password" 
                                value={editUser.password} 
                                onChange={e => setEditUser({ ...editUser, password: e.target.value })} 
                                placeholder="New Password" 
                                required 
                            />
                            <button onClick={handleUpdate}>Update User</button>
                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default UserManagement;
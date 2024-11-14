import React, { useState } from 'react';

const Signup = ({ onSignup, updateUserList }) => {
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleSignUp = () => {
        // Retrieve users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if the username already exists
        if (users.some(user => user.username === signupUsername)) {
            alert('Username already exists. Please choose another one.');
            return;
        }

        // Store the new user in localStorage
        users.push({ username: signupUsername, password: signupPassword });
        localStorage.setItem('users', JSON.stringify(users));
        alert('User signed up successfully.');

        // Call the onSignup prop with the new username
        onSignup(signupUsername);
        setSignupUsername('');
        setSignupPassword('');
        updateUserList(); // This can be used for updating user lists if needed
    };

    return (
        <div id="signupSection">
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
        </div>
    );
};

export default Signup;


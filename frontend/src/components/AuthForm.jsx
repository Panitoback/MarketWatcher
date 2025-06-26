import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

function AuthForm({ type, onAuthSuccess }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // Only for register
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // For success/error messages

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        setMessage(''); // Clear previous messages
        try {
            let response;
            if (type === 'register') {
                response = await axios.post(API_URL + 'register', { username, email, password });
            } else { // type === 'login'
                response = await axios.post(API_URL + 'login', { username, password });
            }

            // Store the token (e.g., in localStorage)
            localStorage.setItem('token', response.data.token);
            setMessage(response.data.message || 'Success!');

            // Call the success callback passed from parent (e.g., App.jsx)
            if (onAuthSuccess) {
                onAuthSuccess(response.data.token);
            }

        } catch (error) {
            console.error('Authentication error:', error.response ? error.response.data : error.message);
            setMessage(error.response ? error.response.data.message : 'An error occurred.');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#333', color: '#eee' }}>
            <h2>{type === 'register' ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: '#eee' }}
                    />
                </div>
                {type === 'register' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: '#eee' }}
                        />
                    </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: '#eee' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                    {type === 'register' ? 'Register' : 'Login'}
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('Success') ? 'lightgreen' : 'salmon' }}>{message}</p>}
        </div>
    );
}

export default AuthForm;
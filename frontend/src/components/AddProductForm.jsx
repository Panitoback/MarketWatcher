import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products/';

function AddProductForm({ token, onProductAdded }) {
    const [url, setUrl] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post(API_URL, {
                url,
                targetPrice: parseFloat(targetPrice) // Ensure targetPrice is a number
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage(response.data.message || 'Product added!');
            setUrl(''); // Clear form
            setTargetPrice(''); // Clear form
            if (onProductAdded) {
                onProductAdded(); // Callback to trigger product list refresh
            }

        } catch (error) {
            console.error('Error adding product:', error.response ? error.response.data : error.message);
            setMessage(error.response ? error.response.data.message : 'An error occurred while adding product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#333', color: '#eee' }}>
            <h2>Add New Product to Monitor</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Product URL:</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: '#eee' }}
                        placeholder="e.g., https://www.amazon.ca/..."
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Target Price:</label>
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: '#eee' }}
                        placeholder="e.g., 500.00"
                    />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('Success') || message.includes('added') ? 'lightgreen' : 'salmon' }}>{message}</p>}
        </div>
    );
}

export default AddProductForm;
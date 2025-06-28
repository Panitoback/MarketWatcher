import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products/';

function ProductList({ token, refreshTrigger }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');

    // NEW STATE for update functionality
    const [editingProductId, setEditingProductId] = useState(null);
    const [newTargetPrice, setNewTargetPrice] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updateMessage, setUpdateMessage] = useState(''); // New state for update messages

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDeleteMessage(''); // Clear messages on refresh
        setUpdateMessage(''); // Clear update message on refresh
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err.response ? err.response.data : err.message);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleDelete = async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            setLoading(true);
            setDeleteMessage('');
            try {
                await axios.delete(`${API_URL}${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setDeleteMessage(`"${productName}" deleted successfully!`);
                fetchProducts(); // Refresh the list
            } catch (err) {
                console.error('Error deleting product:', err.response ? err.response.data : err.message);
                setDeleteMessage(`Failed to delete "${productName}".`);
            } finally {
                setLoading(false);
            }
        }
    };

    // NEW FUNCTION: Handle product update
    const handleUpdate = async (e, productId) => {
        e.preventDefault();
        setLoading(true);
        setUpdateMessage('');

        try {
            const payload = {};
            if (newTargetPrice !== '') payload.targetPrice = parseFloat(newTargetPrice);
            if (newStatus !== '') payload.status = newStatus;

            if (Object.keys(payload).length === 0) {
                setUpdateMessage('No changes to apply.');
                setLoading(false);
                return;
            }

            const response = await axios.put(`${API_URL}${productId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUpdateMessage(response.data.message || 'Product updated successfully!');
            setEditingProductId(null); // Exit editing mode
            setNewTargetPrice(''); // Clear form fields
            setNewStatus('');
            fetchProducts(); // Refresh the list
        } catch (err) {
            console.error('Error updating product:', err.response ? err.response.data : err.message);
            setUpdateMessage(err.response ? err.response.data.message : 'Failed to update product.');
        } finally {
            setLoading(false);
        }
    };

    // Function to start editing a product
    const startEditing = (product) => {
        setEditingProductId(product._id);
        setNewTargetPrice(product.targetPrice);
        setNewStatus(product.status);
        setUpdateMessage(''); // Clear any previous update messages
    };

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token, fetchProducts, refreshTrigger]);

    if (loading && products.length === 0) return <p>Loading products...</p>;
    if (error) return <p style={{ color: 'salmon' }}>{error}</p>;
    if (products.length === 0) return <p>No products being monitored yet. Add one!</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#333' }}>
            <h2>Your Monitored Products</h2>
            {deleteMessage && (
                <p style={{ color: deleteMessage.includes('successfully') ? 'lightgreen' : 'salmon', marginBottom: '15px' }}>
                    {deleteMessage}
                </p>
            )}
            {updateMessage && (
                <p style={{ color: updateMessage.includes('successfully') ? 'lightgreen' : 'salmon', marginBottom: '15px' }}>
                    {updateMessage}
                </p>
            )}
            {loading && products.length > 0 && <p>Updating list...</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map(product => (
                    <div key={product._id} style={{ border: '1px solid #555', borderRadius: '8px', padding: '15px', backgroundColor: '#2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', maxWidth: '150px', height: 'auto', borderRadius: '4px', marginBottom: '10px' }} />
                        )}
                        <h3 style={{ fontSize: '1.2em', marginBottom: '8px', textAlign: 'center' }}>{product.name}</h3>
                        <p><strong>Current Price:</strong> ${product.currentPrice}</p>
                        <p><strong>Target Price:</strong> ${product.targetPrice}</p>
                        <p><strong>Status:</strong> {product.status}</p>
                        <p style={{ fontSize: '0.8em', color: '#bbb' }}>Last Scraped: {new Date(product.lastScrapedAt).toLocaleString()}</p>
                        <a href={product.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', marginTop: '10px' }}>View Product</a>

                        {/* Buttons for Edit and Delete */}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => startEditing(product)}
                                disabled={loading}
                                style={{
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#007bff', // Blue color for edit
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9em'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(product._id, product.name)}
                                disabled={loading}
                                style={{
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#dc3545', // Red color for delete
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9em'
                                }}
                            >
                                Delete
                            </button>
                        </div>

                        {/* NEW: Update Form (appears when editingProductId matches) */}
                        {editingProductId === product._id && (
                            <form onSubmit={(e) => handleUpdate(e, product._id)} style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #555', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#3a3a3a' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#eee' }}>Edit Product</h4>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>New Target Price:</label>
                                    <input
                                        type="number"
                                        value={newTargetPrice}
                                        onChange={(e) => setNewTargetPrice(e.target.value)}
                                        step="0.01"
                                        style={{ width: 'calc(100% - 22px)', padding: '8px', borderRadius: '4px', border: '1px solid #666', backgroundColor: '#444', color: '#eee' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Status:</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #666', backgroundColor: '#444', color: '#eee' }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="error">Error</option> {/* Though 'error' is usually set by scraper */}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={loading} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontSize: '0.9em' }}>
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingProductId(null)} disabled={loading} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', fontSize: '0.9em' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
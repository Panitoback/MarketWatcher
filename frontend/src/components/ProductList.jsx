import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products/';

// Add refreshTrigger as a prop
function ProductList({ token, refreshTrigger }) { 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Make fetchProducts a useCallback to avoid re-creating it on every render
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
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
    }, [token]); // fetchProducts only changes if token changes

    // Fetch products when the component mounts, token changes, OR refreshTrigger changes
    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token, fetchProducts, refreshTrigger]); // Add fetchProducts and refreshTrigger to dependencies

    if (loading) return <p>Loading products...</p>;
    if (error) return <p style={{ color: 'salmon' }}>{error}</p>;
    if (products.length === 0) return <p>No products being monitored yet. Add one!</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#333' }}>
            <h2>Your Monitored Products</h2>
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
                        {/* Add update/delete buttons later */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
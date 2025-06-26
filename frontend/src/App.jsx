import { useState, useEffect, useCallback } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import ProductList from './components/ProductList';
import AddProductForm from './components/AddProductForm'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [token, setToken] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(0); // State to trigger product list refresh

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  const handleAuthSuccess = (newToken) => {
    setIsLoggedIn(true);
    setToken(newToken);
    alert('Authentication successful!');
    setRefreshProducts(prev => prev + 1); // Trigger initial product list fetch
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setToken(null);
    setRefreshProducts(0); 
    alert('Logged out.');
  };

  // Callback to trigger product list refresh after a product is added/deleted/updated
  const handleProductChange = useCallback(() => {
    setRefreshProducts(prev => prev + 1);
  }, []);

  return (
    <div className="App">
      <h1>Market Watcher</h1>
      {isLoggedIn ? (
        <div>
          <p>You are logged in!</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' }}>
            Logout
          </button>

          <AddProductForm token={token} onProductAdded={handleProductChange} />

          <ProductList token={token} refreshTrigger={refreshProducts} /> 
        </div>
      ) : (
        <div>
          {showRegister ? (
            <AuthForm type="register" onAuthSuccess={handleAuthSuccess} />
          ) : (
            <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />
          )}
          <p style={{ marginTop: '20px' }}>
            {showRegister ? (
              <>Already have an account? <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Login</button></>
            ) : (
              <>Don't have an account? <button onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Register</button></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://ecommerce-api-wo04.onrender.com';

interface Product {
  id: number;
  name: string;
  price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string>("");
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      setToken(response.data.token);
      alert('Login สำเร็จ!');
    } catch (error) { alert('Login ล้มเหลว'); }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API_URL}/products`, 
        { name: newProductName, price: Number(newProductPrice), stock: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('สร้างสินค้าสำเร็จ!');
      setNewProductName(""); setNewProductPrice("");
      fetchProducts();
    } catch (error) { alert('สร้างไม่สำเร็จ'); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่ไหม?")) return;
    try {
      await axios.delete(`${API_URL}/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) { alert('ลบไม่สำเร็จ'); }
  };

  const addToCart = (product: Product) => {
    setCart([...cart, { ...product, price: Number(product.price) }]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container">
      <header>
        <h1>🛒 Ecommerce</h1>
        <p style={{textAlign: 'center', color: '#888'}}>แหล่งรวมสินค้าไอที แห่งอนาคต</p>
      </header>

      {/* 🛒 ตะกร้า */}
      {cart.length > 0 && (
        <div className="box-panel" style={{ borderLeft: '4px solid #00f260' }}>
          <h2>🛍️ ตะกร้าสินค้า ({cart.length})</h2>
          <ul>
            {cart.map((item, index) => <li key={index}>{item.name} - ฿{item.price.toLocaleString()}</li>)}
          </ul>
          <h3>รวม: <span style={{ color: '#00f260' }}>฿{totalPrice.toLocaleString()}</span></h3>
          <button onClick={() => setCart([])} style={{background: '#444', color: 'white'}}>ล้างตะกร้า</button>
        </div>
      )}

      {/* 🔐 Admin Zone */}
      <div className="box-panel">
        {!token ? (
          <div style={{display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
            <span>🔐 Admin:</span>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={{width: '150px'}} />
            <input type="password" placeholder="Pass" onChange={e => setPassword(e.target.value)} style={{width: '150px'}} />
            <button onClick={handleLogin} className="btn-admin">Login</button>
          </div>
        ) : (
          <div>
            <h3>➕ จัดการสินค้า (Admin Mode)</h3>
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <input placeholder="ชื่อสินค้าใหม่" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
              <input type="number" placeholder="ราคา" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
            </div>
            <button onClick={handleCreateProduct} className="btn-admin">ลงขายทันที</button>
            <button onClick={() => setToken("")} style={{background: '#333', color: '#888'}}>Logout</button>
          </div>
        )}
      </div>

      {/* 🔍 Search */}
      <div style={{marginBottom: '20px'}}>
        <input 
          placeholder="🔍 ค้นหา Gadget ที่คุณสนใจ..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: '1.1rem' }}
        />
      </div>

      {/* 📦 Grid สินค้า */}
      <div className="product-grid">
        {(filteredProducts.length > 0 ? filteredProducts : []).map((p) => (
          <div key={p.id} className="product-card">
            <span className="emoji-icon">📦</span>
            <h3>{p.name}</h3>
            <p className="price-tag">฿{p.price.toLocaleString()}</p>
            
            <button onClick={() => addToCart(p)} className="btn-add">หยิบใส่ตะกร้า</button>
            {token && (
              <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete">ลบ</button>
            )}
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && <p style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>ไม่พบสินค้า...</p>}
    </div>
  );
}

export default App;
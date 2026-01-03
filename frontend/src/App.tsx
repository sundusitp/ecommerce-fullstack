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
  
  // ✨ State สำหรับค้นหา
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      setToken(response.data.token);
      alert('Login สำเร็จ!');
    } catch (error) {
      alert('Login ล้มเหลว');
    }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API_URL}/products`, 
        { name: newProductName, price: Number(newProductPrice), stock: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('สร้างสินค้าสำเร็จ!');
      setNewProductName(""); // เคลียร์ช่อง
      setNewProductPrice(""); // เคลียร์ช่อง
      fetchProducts();
    } catch (error) {
      alert('สร้างไม่สำเร็จ');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่ไหม?")) return;
    try {
      // ใช้ Route ที่เราแก้ไปเมื่อกี้ (/delete-product/)
      await axios.delete(`${API_URL}/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('ลบสินค้าสำเร็จ!');
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('ลบไม่สำเร็จ (เช็ค Backend หรือ Token)');
    }
  };

  const addToCart = (product: Product) => {
    const formattedProduct = {
      ...product,
      price: Number(product.price)
    };
    setCart([...cart, formattedProduct]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // 🔍 Logic การกรองสินค้า (Search)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial', color: '#eee' }}>
      <h1>🛒 Sundusit Shop Online</h1>

      {/* ตะกร้าสินค้า */}
      <div style={{ background: '#222', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #444' }}>
        <h2>🛍️ ตะกร้าของคุณ ({cart.length} ชิ้น)</h2>
        {cart.length === 0 ? <p>ยังไม่มีของในตะกร้า</p> : (
          <ul>
            {cart.map((item, index) => <li key={index}>{item.name} - ฿{item.price.toLocaleString()}</li>)}
          </ul>
        )}
        <hr />
        <h3>ยอดรวมทั้งหมด: <span style={{ color: 'gold' }}>฿{totalPrice.toLocaleString()}</span></h3>
        <button onClick={() => setCart([])} style={{ background: '#444' }}>ล้างตะกร้า</button>
      </div>

      {/* ส่วน Admin */}
      {!token ? (
        <div style={{ background: '#333', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>🔐 Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div style={{ background: '#004d00', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>➕ เพิ่มสินค้าใหม่</h3>
          <input placeholder="ชื่อสินค้า" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
          <input type="number" placeholder="ราคา" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
          <button onClick={handleCreateProduct}>เพิ่มสินค้า</button>
          <button onClick={() => setToken("")} style={{ background: 'red', marginLeft: '10px' }}>Logout</button>
        </div>
      )}

      {/* 🔍 ช่องค้นหา (Search Bar) */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 ค้นหาสินค้า..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px' }}
        />
      </div>

      {/* รายการสินค้า (ใช้ filteredProducts) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {(filteredProducts.length > 0 ? filteredProducts : []).map((p) => (
          <div key={p.id} style={{ border: '1px solid #444', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📦</div>
            <h3>{p.name}</h3>
            <p style={{ color: 'lightgreen', fontSize: '1.2em' }}>฿{p.price.toLocaleString()}</p>
            
            <button onClick={() => addToCart(p)} style={{ background: '#007bff', width: '100%' }}>🛒 หยิบใส่ตะกร้า</button>
            
            {token && (
              <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#dc3545', width: '100%', marginTop: '5px' }}>🗑️ ลบสินค้า</button>
            )}
          </div>
        ))}
      </div>
      
      {/* ถ้าค้นหาแล้วไม่เจอ */}
      {filteredProducts.length === 0 && <p style={{textAlign: 'center'}}>ไม่พบสินค้าที่คุณค้นหา...</p>}
    </div>
  );
}

export default App;
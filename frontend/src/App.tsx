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
  const [cart, setCart] = useState<Product[]>([]); // ✨ ระบบตะกร้า

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
      fetchProducts();
    } catch (error) {
      alert('สร้างไม่สำเร็จ');
    }
  };

  // ✨ ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่ไหม?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      alert('ลบไม่สำเร็จ (คุณอาจต้องเพิ่ม Route Delete ที่ Backend ก่อน)');
    }
  };

  // ✨ ฟังก์ชันจัดการตะกร้า
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial', color: '#eee' }}>
      <h1>🛒 ขั้นเทพ Ecommerce Pro</h1>

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

      {/* ระบบ Admin */}
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
          <input placeholder="ชื่อสินค้า" onChange={e => setNewProductName(e.target.value)} />
          <input type="number" placeholder="ราคา" onChange={e => setNewProductPrice(e.target.value)} />
          <button onClick={handleCreateProduct}>เพิ่มสินค้า</button>
          <button onClick={() => setToken("")} style={{ background: 'red', marginLeft: '10px' }}>Logout</button>
        </div>
      )}

      {/* รายการสินค้า */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {(products || []).map((p) => (
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
    </div>
  );
}

export default App;
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

  // State สำหรับ Login และ Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  // ✨ State สำหรับโหมดแก้ไข (เก็บ ID ของสินค้าที่จะแก้)
  const [editingId, setEditingId] = useState<number | null>(null);

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
      alert('✨ สร้างสินค้าสำเร็จ!');
      setNewProductName(""); setNewProductPrice("");
      fetchProducts();
    } catch (error) { alert('สร้างไม่สำเร็จ'); }
  };

  // ✏️ ฟังก์ชันเริ่มแก้ไข (ดึงข้อมูลขึ้นไปรอที่ช่อง Input)
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอขึ้นบนสุด
  };

  // ❌ ยกเลิกการแก้ไข
  const cancelEdit = () => {
    setEditingId(null);
    setNewProductName("");
    setNewProductPrice("");
  };

  // 💾 บันทึกการแก้ไข (ส่งไป Backend)
  const handleUpdateProduct = async () => {
    if (!editingId) return;
    try {
      await axios.put(`${API_URL}/products/${editingId}`, 
        { name: newProductName, price: Number(newProductPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ แก้ไขข้อมูลสำเร็จ!');
      cancelEdit(); // เคลียร์สถานะ
      fetchProducts();
    } catch (error) {
      alert('แก้ไขไม่สำเร็จ (อย่าลืมเพิ่ม Route PUT ที่ Backend นะ!)');
    }
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

      {/* 🛒 ตะกร้าสินค้า */}
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

      {/* 🔐 Admin Panel (ใช้ร่วมกันทั้ง เพิ่ม และ แก้ไข) */}
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
            <h3>{editingId ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}</h3>
            
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <input 
                placeholder="ชื่อสินค้า" 
                value={newProductName} 
                onChange={e => setNewProductName(e.target.value)} 
              />
              <input 
                type="number" 
                placeholder="ราคา" 
                value={newProductPrice} 
                onChange={e => setNewProductPrice(e.target.value)} 
              />
            </div>

            {/* ปุ่มจะเปลี่ยนไปตามสถานะ (เพิ่ม หรือ แก้ไข) */}
            {editingId ? (
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={handleUpdateProduct} className="btn-primary" style={{background: '#ffc107', color: 'black'}}>💾 บันทึกการแก้ไข</button>
                <button onClick={cancelEdit} className="btn-secondary">❌ ยกเลิก</button>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '10px'}}>
                 <button onClick={handleCreateProduct} className="btn-admin">+ ลงขายทันที</button>
                 <button onClick={() => setToken("")} style={{background: '#333', color: '#888'}}>Logout</button>
              </div>
            )}
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
            
            {/* แสดงปุ่มแก้ไข/ลบ เฉพาะตอน Login */}
            {token && (
              <div style={{marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '5px'}}>
                <button onClick={() => startEdit(p)} className="btn-secondary" style={{fontSize: '0.8rem'}}>✏️ แก้ไข</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete" style={{fontSize: '0.8rem'}}>ลบ</button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && <p style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>ไม่พบสินค้า...</p>}
    </div>
  );
}

export default App;
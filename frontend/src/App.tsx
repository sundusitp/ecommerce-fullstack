import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string>("");
  
  // 🛒 ตะกร้า
  const [cart, setCart] = useState<Product[]>(() => {
    const saved = localStorage.getItem("myShopCart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("myShopCart", JSON.stringify(cart));
  }, [cart]);

  const [searchTerm, setSearchTerm] = useState("");
  
  // Login & Register States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false); // ✨ โหมดสมัครสมาชิก

  // Form States
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) { setProducts([]); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ✨ ฟังก์ชัน Login
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      setToken(response.data.token);
      alert('✅ Login สำเร็จ! ยินดีต้อนรับครับ');
    } catch (error) { 
      alert('❌ Login ไม่สำเร็จ (User นี้อาจจะหายไปตอนแก้ Database ลองกด "สมัครใหม่" ดูครับ)'); 
    }
  };

  // ✨ ฟังก์ชัน Register (สมัครสมาชิกใหม่)
  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/users/register`, { 
        email, 
        password, 
        name: "Admin" 
      });
      alert('✨ สมัครสมาชิกสำเร็จ! กรุณากด Login อีกครั้ง');
      setIsRegisterMode(false); // กลับไปหน้า Login
    } catch (error) {
      alert('❌ สมัครไม่สำเร็จ (Email นี้อาจจะมีแล้ว)');
    }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API_URL}/products`, 
        { 
          name: newProductName, 
          price: Number(newProductPrice), 
          imageUrl: newProductImage 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✨ สร้างสินค้าสำเร็จ!');
      clearForm();
      fetchProducts();
    } catch (error) { alert('สร้างไม่สำเร็จ'); }
  };

  const handleUpdateProduct = async () => {
    if (!editingId) return;
    try {
      await axios.put(`${API_URL}/products/${editingId}`, 
        { 
          name: newProductName, 
          price: Number(newProductPrice), 
          imageUrl: newProductImage 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ แก้ไขข้อมูลสำเร็จ!');
      clearForm();
      fetchProducts();
    } catch (error) { alert('แก้ไขไม่สำเร็จ'); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("ลบจริงนะ?")) return;
    try {
      await axios.delete(`${API_URL}/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) { alert('ลบไม่สำเร็จ'); }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    setNewProductImage(product.imageUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setEditingId(null);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductImage("");
  };

  const addToCart = (product: Product) => {
    setCart([...cart, { ...product, price: Number(product.price) }]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container">
      <header>
        <h1>🛒 Mu Ecommerce</h1>
        <p style={{textAlign: 'center', color: '#888'}}>แหล่งรวมสินค้าไอที แห่งอนาคต</p>
      </header>

      {/* 🛒 ตะกร้า */}
      {cart.length > 0 && (
        <div className="box-panel" style={{ borderLeft: '4px solid #00f260' }}>
          <h2>🛍️ ตะกร้า ({cart.length})</h2>
          <ul>
            {cart.map((item, index) => <li key={index}>{item.name} - ฿{item.price.toLocaleString()}</li>)}
          </ul>
          <h3>รวม: <span style={{ color: '#00f260' }}>฿{totalPrice.toLocaleString()}</span></h3>
          <button onClick={() => setCart([])} style={{background: '#444', color: 'white'}}>ล้างตะกร้า</button>
        </div>
      )}

      {/* 🔐 Admin Panel */}
      <div className="box-panel">
        {!token ? (
          // ✨ ส่วน Login / Register ที่แก้ให้ตรงกลางแล้ว
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <span style={{fontWeight: 'bold'}}>
                {isRegisterMode ? "📝 สมัครสมาชิก:" : "🔐 Admin Login:"}
              </span>
              <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={{width: '150px'}} />
              <input type="password" placeholder="Pass" onChange={e => setPassword(e.target.value)} style={{width: '150px'}} />
              
              {isRegisterMode ? (
                <button onClick={handleRegister} className="btn-primary" style={{background: '#00f260', color: 'black'}}>สมัครเลย</button>
              ) : (
                <button onClick={handleLogin} className="btn-admin">Login</button>
              )}
            </div>
            
            {/* ปุ่มสลับโหมด */}
            <p style={{fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', color: '#888'}} 
               onClick={() => setIsRegisterMode(!isRegisterMode)}>
               {isRegisterMode ? "กลับไปหน้า Login" : "ยังไม่มี User? กดเพื่อสมัครใหม่"}
            </p>
          </div>
        ) : (
          <div>
            <h3>{editingId ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px'}}>
              <input placeholder="ชื่อสินค้า" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
              <input type="number" placeholder="ราคา" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
              <input placeholder="URL รูปภาพ (https://...)" value={newProductImage} onChange={e => setNewProductImage(e.target.value)} />
            </div>
            {editingId ? (
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={handleUpdateProduct} style={{background: '#ffc107', color: 'black'}}>💾 บันทึก</button>
                <button onClick={clearForm} className="btn-secondary">❌ ยกเลิก</button>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '10px'}}>
                 <button onClick={handleCreateProduct} className="btn-admin">+ ลงขาย</button>
                 <button onClick={() => setToken("")} style={{background: '#333', color: '#888'}}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      <input 
        placeholder="🔍 ค้นหาสินค้า..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', fontSize: '1.1rem' }}
      />

      <div className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="product-card">
            <img 
              src={p.imageUrl || "https://placehold.co/600x400?text=No+Image"} 
              alt={p.name} 
              style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px'}}
              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }} 
            />
            <h3>{p.name}</h3>
            <p className="price-tag">฿{p.price.toLocaleString()}</p>
            <button onClick={() => addToCart(p)} className="btn-add">ใส่ตะกร้า</button>
            {token && (
              <div style={{marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '5px'}}>
                <button onClick={() => startEdit(p)} className="btn-secondary" style={{fontSize: '0.8rem'}}>✏️ แก้</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete" style={{fontSize: '0.8rem'}}>ลบ</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
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

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface AdminOrder extends Order {
  user: { email: string; name: string | null; };
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  
  const [cart, setCart] = useState<Product[]>(() => {
    const saved = localStorage.getItem("myShopCart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem("myShopCart", JSON.stringify(cart)); }, [cart]);

  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false); 

  // Form States
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  // 📸 เปลี่ยนจาก URL เป็นไฟล์ Object
  const [newProductFile, setNewProductFile] = useState<File | null>(null); 
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) { setProducts([]); }
  };

  const fetchMyOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/my-orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(response.data);
    } catch (error) { console.error("Load orders failed"); }
  };

  const fetchAdminOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders`);
      setAdminOrders(response.data);
    } catch (error) { console.error("Load admin orders failed"); }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { 
    if(token) {
      fetchMyOrders();
      if (role === 'ADMIN') fetchAdminOrders();
    } else {
      setOrders([]); setAdminOrders([]);
    }
  }, [token, role]);

  const handleCheckout = async () => {
    if (!token) { alert("⚠️ กรุณา Login ก่อน"); return; }
    if (cart.length === 0) return;
    if (!window.confirm(`ยืนยันการสั่งซื้อ?`)) return;

    try {
      await axios.post(`${API_URL}/orders`, { items: cart }, { headers: { Authorization: `Bearer ${token}` } });
      alert("🎉 สั่งซื้อสำเร็จ!");
      setCart([]); fetchMyOrders();
      if (role === 'ADMIN') fetchAdminOrders();
    } catch (error) { alert("❌ ผิดพลาด"); }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { email, password });
      setToken(res.data.token); setRole(res.data.user.role); alert(`✅ Login สำเร็จ!`);
    } catch (error) { alert('❌ Login ไม่สำเร็จ'); }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/users/register`, { email, password, name: "User" });
      alert('✨ สมัครสำเร็จ! Login ได้เลย'); setIsRegisterMode(false); 
    } catch (error) { alert('❌ สมัครไม่สำเร็จ'); }
  };

  // 🛠️ ฟังก์ชันสร้างสินค้า (แบบส่งไฟล์)
  const handleCreateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newProductName);
      formData.append('price', newProductPrice);
      if (newProductFile) {
        formData.append('image', newProductFile); // แนบไฟล์ไปกับ key ชื่อ 'image'
      }

      await axios.post(`${API_URL}/products`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // 👈 สำคัญมาก! บอก Server ว่ามีไฟล์แนบมา
        } 
      });
      alert('✨ สร้างสินค้าสำเร็จ!'); clearForm(); fetchProducts();
    } catch (error) { alert('สร้างไม่สำเร็จ'); }
  };

  // 🛠️ ฟังก์ชันแก้ไขสินค้า (แบบส่งไฟล์)
  const handleUpdateProduct = async () => {
    if (!editingId) return;
    try {
      const formData = new FormData();
      formData.append('name', newProductName);
      formData.append('price', newProductPrice);
      if (newProductFile) {
        formData.append('image', newProductFile);
      }

      await axios.put(`${API_URL}/products/${editingId}`, formData, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      alert('✅ แก้ไขสำเร็จ!'); clearForm(); fetchProducts();
    } catch (error) { alert('แก้ไขไม่สำเร็จ'); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("ลบจริงนะ?")) return;
    try {
      await axios.delete(`${API_URL}/delete-product/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (error) { alert('ลบไม่สำเร็จ'); }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    setNewProductFile(null); // เคลียร์ไฟล์เดิม (ถ้าไม่เลือกใหม่ ก็ใช้รูปเดิม)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setEditingId(null); setNewProductName(""); setNewProductPrice(""); setNewProductFile(null);
  };

  const addToCart = (product: Product) => {
    setCart([...cart, { ...product, price: Number(product.price) }]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const totalRevenue = adminOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const isAdmin = token && role === 'ADMIN';

  return (
    <div className="container">
      <header>
        <h1>🛒 Mu Ecommerce</h1>
        <p style={{textAlign: 'center', color: '#888'}}>แหล่งรวมสินค้าไอที แห่งอนาคต</p>
      </header>

      {/* 🛒 Cart */}
      {cart.length > 0 && (
        <div className="box-panel" style={{ borderLeft: '4px solid #00f260' }}>
          <h2>🛍️ ตะกร้าสินค้า</h2>
          <ul>{cart.map((item, index) => <li key={index}>{item.name} - ฿{item.price.toLocaleString()}</li>)}</ul>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
             <h3>รวม: <span style={{ color: '#00f260' }}>฿{totalPrice.toLocaleString()}</span></h3>
             <div>
               <button onClick={() => setCart([])} style={{background: '#444', color: 'white', marginRight: '5px'}}>ล้างตะกร้า</button>
               <button onClick={handleCheckout} className="btn-primary">✅ ยืนยันคำสั่งซื้อ</button>
             </div>
          </div>
        </div>
      )}

      {/* 🔐 Admin / User Panel */}
      <div className="box-panel">
        {!token ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <span style={{fontWeight: 'bold'}}>{isRegisterMode ? "📝 สมัครสมาชิก:" : "🔐 เข้าสู่ระบบ:"}</span>
              <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={{width: '150px'}} />
              <input type="password" placeholder="Pass" onChange={e => setPassword(e.target.value)} style={{width: '150px'}} />
              {isRegisterMode ? (
                <button onClick={handleRegister} className="btn-primary" style={{background: '#00f260', color: 'black'}}>สมัครเลย</button>
              ) : (
                <button onClick={handleLogin} className="btn-admin">Login</button>
              )}
            </div>
            <p style={{fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', color: '#888'}} 
               onClick={() => setIsRegisterMode(!isRegisterMode)}>
               {isRegisterMode ? "กลับไปหน้า Login" : "ยังไม่มี User? กดเพื่อสมัครใหม่"}
            </p>
          </div>
        ) : (
          <div>
            {isAdmin ? (
              <>
                <div style={{background: '#2d3748', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4a5568'}}>
                  <h2 style={{color: '#63b3ed', marginTop: 0}}>📊 Admin Dashboard</h2>
                  <h1 style={{fontSize: '2.5rem', margin: '10px 0'}}>฿{totalRevenue.toLocaleString()}</h1>
                  <p>จำนวนคำสั่งซื้อ: {adminOrders.length} ออเดอร์</p>
                </div>

                <h3>{editingId ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่ (Admin)"}</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px'}}>
                  <input placeholder="ชื่อสินค้า" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                  <input type="number" placeholder="ราคา" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                  
                  {/* 📷 Input สำหรับเลือกไฟล์รูป */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '0.9rem', color: '#aaa'}}>รูปสินค้า:</label>
                    <input type="file" accept="image/*" onChange={e => setNewProductFile(e.target.files?.[0] || null)} />
                  </div>

                </div>
                {editingId ? (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={handleUpdateProduct} style={{background: '#ffc107', color: 'black'}}>💾 บันทึก</button>
                    <button onClick={clearForm} className="btn-secondary">❌ ยกเลิก</button>
                  </div>
                ) : (
                  <button onClick={handleCreateProduct} className="btn-admin">+ ลงขาย</button>
                )}
              </>
            ) : (
              <div style={{textAlign: 'center'}}>
                <h3>👋 ยินดีต้อนรับ คุณ {email}</h3>
              </div>
            )}
            <button onClick={() => {setToken(""); setRole(""); setOrders([]); setAdminOrders([]);}} style={{marginTop: '10px', background: '#333', color: '#888'}}>Logout</button>
          </div>
        )}
      </div>

       {/* My Orders */}
       {token && orders.length > 0 && (
        <div className="box-panel" style={{ borderLeft: '4px solid #007bff', marginTop: '20px' }}>
          <h2>📦 ประวัติการสั่งซื้อของฉัน ({orders.length})</h2>
          <div style={{maxHeight: '200px', overflowY: 'auto'}}>
            {orders.map((order) => (
              <div key={order.id} style={{borderBottom: '1px solid #eee', padding: '10px 0'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
                  <span>บิล #{order.id} ({new Date(order.createdAt).toLocaleDateString()})</span>
                  <span style={{color: 'green'}}>฿{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <input placeholder="🔍 ค้นหาสินค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '20px', fontSize: '1.1rem', marginTop: '20px' }} />
      <div className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="product-card">
             {/* แสดงรูป (ถ้าไม่มีให้ใช้รูป Default) */}
             <img 
                src={p.imageUrl || "https://placehold.co/600x400?text=No+Image"} 
                alt={p.name} 
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400?text=Error"}
             />
            <h3>{p.name}</h3>
            <p className="price-tag">฿{p.price.toLocaleString()}</p>
            <button onClick={() => addToCart(p)} className="btn-add">ใส่ตะกร้า</button>
            {isAdmin && (
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
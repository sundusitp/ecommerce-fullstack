import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string>("");
  
  // ตัวแปรสำหรับฟอร์ม
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  // 1. ดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. ฟังก์ชัน Login
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/users/login', {
        email, password
      });
      setToken(response.data.token); // เก็บ Token ไว้ในตัวแปร
      alert('Login สำเร็จ! ตอนนี้คุณคือเจ้าของร้านแล้ว 😎');
    } catch (error) {
      alert('รหัสผิดครับพี่ชาย!');
    }
  };

  // 3. ฟังก์ชันสร้างสินค้า (ต้องใช้ Token)
  const handleCreateProduct = async () => {
    try {
      if (!token) return alert('ต้อง Login ก่อนนะ!');

      await axios.post('http://localhost:3000/products', 
        {
          name: newProductName,
          price: Number(newProductPrice),
          stock: 10
        },
        {
          headers: { Authorization: `Bearer ${token}` } // แนบบัตรผ่านไปให้ยาม
        }
      );
      
      alert('ลงขายสินค้าเรียบร้อย!');
      fetchProducts(); // ดึงข้อมูลใหม่มาโชว์ทันที
    } catch (error) {
      alert('สร้างสินค้าไม่สำเร็จ');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>🛒 ร้านค้า Ecommerce ขั้นเทพ</h1>

      {/* ส่วน Login (จะโชว์เฉพาะตอนยังไม่มี Token) */}
      {!token ? (
        <div style={{ background: '#333', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h2>🔐 เข้าสู่ระบบ (สำหรับคนขาย)</h2>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={{ margin: '5px' }} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={{ margin: '5px' }} />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div style={{ background: '#004d00', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h2>✅ คุณอยู่ในระบบแล้ว (Admin)</h2>
          <h3>ลงขายสินค้าใหม่</h3>
          <input placeholder="ชื่อสินค้า" onChange={e => setNewProductName(e.target.value)} style={{ margin: '5px' }} />
          <input type="number" placeholder="ราคา" onChange={e => setNewProductPrice(e.target.value)} style={{ margin: '5px' }} />
          <button onClick={handleCreateProduct}>วางขายทันที!</button>
          <button onClick={() => setToken("")} style={{ marginLeft: '10px', background: 'red' }}>Logout</button>
        </div>
      )}

      {/* รายการสินค้า */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #555', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>📱 <b>{p.name}</b></span>
            <span style={{ color: 'lightgreen' }}>฿{p.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS, TABLES, USERS, CONTACT_NUMBER } from './constants';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState<'Take-away' | 'Dine-in'>('Dine-in');
  const [time, setTime] = useState(new Date());
  
  // Navigation for Smartphone only
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  
  // User Form Data
  const [dineIn, setDineIn] = useState({ customer: '', user: 'user1', table: 'T1', vip: 0 });
  const [takeaway, setTakeaway] = useState({ name: '', phone: '', address: '' });

  // Persistence
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Automatic Success Modal
  const [showOrderBox, setShowOrderBox] = useState(false);
  const [lastTicket, setLastTicket] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchCat = category === 'All' || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const handleAddToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQty = (id: string | number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const grandTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

  const generateTicket = (orderId: number) => {
    const otp = generateOTP();
    const dateStr = time.toLocaleDateString('en-US');
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
    
    let msg = `🍔 *QUICKBITE ORDER TICKET*\n`;
    msg += `------------------------------\n`;
    msg += `🎟 Order ID: ${orderId}\n`;
    msg += `📅 Ordered On: ${dateStr}\n`;
    msg += `⏰ Ordered At: ${timeStr}\n`;
    msg += `------------------------------\n`;
    
    if (orderType === 'Take-away') {
      msg += `👤 Customer: ${takeaway.name || 'N/A'}\n`;
      msg += `📍 Address: ${takeaway.address || 'N/A'}\n`;
      msg += `📞 Phone: ${takeaway.phone || 'N/A'}\n`;
    } else {
      msg += `👤 Customer: ${dineIn.customer || 'Guest'}\n`;
      msg += `📍 Location: Table ${dineIn.table}\n`;
      msg += `📞 Mode: Dine-in\n`;
    }
    
    msg += `------------------------------\n`;
    msg += `📝 *ITEMS:*\n`;
    cart.forEach(i => {
      msg += `• ${i.name} [x${i.quantity}] - $${(i.price * i.quantity).toFixed(2)}\n`;
    });
    msg += `------------------------------\n`;
    msg += `💵 Subtotal: $${grandTotal.toFixed(2)}\n`;
    msg += `💰 *TOTAL: $${grandTotal.toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `✅ *Fastfood Verification Code: ${otp}*`;
    return msg;
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return alert('Your cart is empty!');
    const orderId = Date.now();
    const orderData = {
      id: orderId,
      time: time.toLocaleTimeString('en-GB'),
      date: time.toLocaleDateString('en-GB'),
      items: [...cart],
      total: grandTotal,
      type: orderType,
      details: orderType === 'Dine-in' ? {...dineIn} : {...takeaway}
    };

    setHistory(prev => [orderData, ...prev]);
    setLastTicket(generateTicket(orderId));
    setShowOrderBox(true); 
    setCart([]);
    setShowMobileCart(false);
  };

  const handleShare = (platform: string) => {
    const encoded = encodeURIComponent(lastTicket);
    const cleanNum = CONTACT_NUMBER.replace('+', '');
    if (platform === 'wa') {
      window.open(`https://wa.me/${cleanNum}?text=${encoded}`, '_blank');
    } else if (platform === 'tg') {
      window.open(`https://t.me/share/url?url=${encoded}`, '_blank');
    }
  };

  return (
    <div className="main-wrapper">
      {/* HEADER - STATIC FIXED */}
      <header className="brand-header">
        {/* Toggle Categories button only on Phone (below md) */}
        <button className="btn btn-dark btn-sm d-md-none me-3" onClick={() => setShowMobileCategories(true)}>
          <i className="bi bi-list fs-3"></i>
        </button>
        
        <div className="d-flex align-items-center">
          <i className="bi bi-lightning-fill text-warning me-2 fs-4"></i>
          <span className="fw-black text-uppercase">QuickBite UK</span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div id="google_translate_element" className="d-none d-lg-block"></div>
          
          {/* Cart Toggle button only on Phone (below md) */}
          <button className="btn btn-primary btn-lg position-relative d-md-none" onClick={() => setShowMobileCart(true)}>
            <i className="bi bi-basket3-fill"></i>
            {cart.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ACTION BAR */}
      <div className="action-bar px-3 py-2 border-bottom d-flex align-items-center gap-3 bg-white">
        <button className="btn btn-primary fw-bold px-4 rounded-pill" onClick={() => { if(confirm('Clear current order?')) setCart([]); }}>
          <i className="bi bi-plus-lg me-1"></i> NEW
        </button>
        
        <div className="input-group input-group-sm flex-grow-1 shadow-sm" style={{maxWidth: '500px'}}>
          <span className="input-group-text bg-white border-end-0 border-primary text-primary"><i className="bi bi-search"></i></span>
          <input 
            type="text" 
            className="form-control border-start-0 border-primary" 
            placeholder="Find food..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
      </div>

      <main className="content-area">
        {/* Categories Sidebar */}
        <aside className={`category-sidebar ${showMobileCategories ? 'show-mobile' : ''}`}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`category-btn ${category === cat ? 'active' : ''}`} 
              onClick={() => { setCategory(cat); setShowMobileCategories(false); }}
            >
              <i className={`bi ${
                cat === 'All' ? 'bi-grid-fill' : 
                cat === 'Shawarma' ? 'bi-fire' : 
                cat === 'Pizza' ? 'bi-pie-chart-fill' : 
                cat === 'Grill' ? 'bi-thermometer-sun' : 
                cat === 'Platter' ? 'bi-collection-fill' : 
                cat === 'Sides' ? 'bi-box-seam-fill' : 'bi-cup-straw'
              }`}></i>
              {cat}
            </button>
          ))}
          <button className="btn btn-danger btn-sm m-3 d-md-none rounded-pill" onClick={()=>setShowMobileCategories(false)}>BACK</button>
        </aside>

        {/* Menu Grid */}
        <section className="item-grid" onClick={() => { if(showMobileCategories) setShowMobileCategories(false); }}>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-xl-4 g-3">
            {filteredItems.map(item => (
              <div key={item.id} className="col">
                <div className="card menu-card h-100 animate__animated animate__fadeIn border-0">
                  <img src={(item as any).img || (item as any).image} alt={item.name} />
                  <div className="card-body p-2 p-md-3 d-flex flex-column">
                    <h6 className="fw-bold mb-1 text-truncate" style={{fontSize: '0.9rem'}}>{item.name}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-black text-primary fs-5">${item.price.toFixed(2)}</span>
                      <button className="add-icon-btn shadow-sm" onClick={()=>handleAddToCart(item)}>
                        <i className="bi bi-cart-plus-fill fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart Sidebar */}
        <aside className={`cart-sidebar ${showMobileCart ? 'show-mobile' : ''}`}>
          <div className="p-3 border-bottom d-flex gap-2 bg-light align-items-center">
            {showMobileCart && <button className="btn btn-outline-dark btn-sm me-auto" onClick={()=>setShowMobileCart(false)}><i className="bi bi-chevron-left"></i></button>}
            <button className={`btn btn-sm flex-fill fw-bold ${orderType === 'Dine-in' ? 'btn-primary' : 'btn-outline-primary border-0'}`} onClick={()=>setOrderType('Dine-in')}>DINE-IN</button>
            <button className={`btn btn-sm flex-fill fw-bold ${orderType === 'Take-away' ? 'btn-warning' : 'btn-outline-warning border-0'}`} onClick={()=>setOrderType('Take-away')}>TAKE-AWAY</button>
          </div>

          <div className="flex-grow-1 overflow-auto p-3">
            <div className="mb-4">
              {orderType === 'Take-away' ? (
                <div className="row g-2 animate__animated animate__fadeIn">
                  <div className="col-12"><input className="form-control" placeholder="Full Name" value={takeaway.name} onChange={e=>setTakeaway({...takeaway, name: e.target.value})}/></div>
                  <div className="col-12"><input className="form-control" placeholder="Phone Number" value={takeaway.phone} onChange={e=>setTakeaway({...takeaway, phone: e.target.value})}/></div>
                  <div className="col-12"><input className="form-control" placeholder="Delivery Address" value={takeaway.address} onChange={e=>setTakeaway({...takeaway, address: e.target.value})}/></div>
                </div>
              ) : (
                <div className="row g-2 animate__animated animate__fadeIn">
                  <div className="col-12"><input className="form-control" placeholder="Guest Name" value={dineIn.customer} onChange={e=>setDineIn({...dineIn, customer: e.target.value})}/></div>
                  <div className="col-6">
                    <select className="form-select" value={dineIn.user} onChange={e=>setDineIn({...dineIn, user: e.target.value})}>
                      {USERS.map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select className="form-select" value={dineIn.table} onChange={e=>setDineIn({...dineIn, table: e.target.value})}>
                      {TABLES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-12 mt-3 bg-light p-3 rounded-3 border border-warning-subtle d-flex justify-content-between align-items-center shadow-sm">
                    <span className="fw-bold text-dark"><i className="bi bi-crown-fill text-warning me-2"></i>VIP GUESTS</span>
                    <div className="d-flex align-items-center gap-3">
                      <button className="btn btn-outline-dark btn-sm rounded-circle px-2" onClick={()=>setDineIn({...dineIn, vip: Math.max(0, dineIn.vip-1)})}>-</button>
                      <span className="fw-black fs-5 text-warning">{dineIn.vip}</span>
                      <button className="btn btn-outline-dark btn-sm rounded-circle px-2" onClick={()=>setDineIn({...dineIn, vip: dineIn.vip+1})}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="opacity-10" />

            {cart.map(item => (
              <div key={item.id} className="bg-light p-3 rounded-4 mb-3 border border-white shadow-sm animate__animated animate__fadeInRight">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold text-truncate" style={{maxWidth: '160px'}}>{item.name}</span>
                  <span className="fw-black text-success">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <div className="btn-group btn-group-sm bg-white rounded-pill overflow-hidden border shadow-sm">
                    <button className="btn btn-light px-3" onClick={()=>updateQty(item.id, -1)}>-</button>
                    <button className="btn btn-white disabled px-3 fw-bold">{item.quantity}</button>
                    <button className="btn btn-light px-3" onClick={()=>updateQty(item.id, 1)}>+</button>
                  </div>
                  <button className="btn btn-link text-danger btn-sm ms-auto p-0" onClick={()=>{setCart(c=>c.filter(i=>i.id!==item.id))}}>
                    <i className="bi bi-trash3-fill fs-5"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-top bg-white shadow-lg">
            <div className="d-flex justify-content-between h3 fw-black text-primary mb-4">
              <span>TOTAL</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-success w-100 py-3 fw-bold rounded-pill shadow-lg" onClick={handlePlaceOrder}>
              PLACE ORDER
            </button>
          </div>
        </aside>
      </main>

      {/* FOOTER - STATIC FIXED */}
      <footer className="status-footer">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill"></i>
          <span>{time.toLocaleTimeString()} UK Terminal (Online)</span>
        </div>
        <div className="ms-auto d-flex gap-4">
          <button className="btn btn-link text-white p-0 fw-bold text-decoration-none" onClick={()=>setShowHistory(true)}>
            <i className="bi bi-journal-text me-1"></i> LOGS
          </button>
        </div>
      </footer>

      {/* SUCCESS MODAL */}
      {showOrderBox && (
        <div className="app-modal-overlay">
          <div className="bg-white rounded-5 p-4 w-100 shadow-2xl animate__animated animate__zoomIn" style={{maxWidth: '460px'}}>
            <div className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex p-3 mb-2 shadow-lg">
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              <h2 className="fw-black text-success">ORDER SAVED!</h2>
              <p className="text-muted small">Ready to share with {CONTACT_NUMBER}</p>
            </div>
            
            <div className="bg-light p-3 rounded-4 border font-monospace text-xs mb-4 shadow-inner" style={{whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', fontSize: '11px'}}>
              {lastTicket}
            </div>

            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-success py-3 fw-bold rounded-pill shadow-sm" onClick={()=>handleShare('wa')}>
                <i className="bi bi-whatsapp me-2"></i>SEND TO BOOKING ({CONTACT_NUMBER})
              </button>
              <button className="btn btn-primary py-3 fw-bold rounded-pill shadow-sm" onClick={()=>handleShare('tg')}>
                <i className="bi bi-telegram me-2"></i>SEND VIA TELEGRAM
              </button>
            </div>
            
            <button className="btn btn-dark w-100 fw-bold rounded-pill py-3 mt-2" onClick={()=>setShowOrderBox(false)}>
              NEW ORDER
            </button>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="app-modal-overlay">
          <div className="bg-white rounded-4 w-100 h-100 d-flex flex-column overflow-hidden shadow-2xl">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0 fw-bold">TERMINAL REPOSITORY</h5>
              <button className="btn-close btn-close-white" onClick={()=>setShowHistory(false)}></button>
            </div>
            <div className="flex-grow-1 overflow-auto">
              <table className="table table-hover table-striped table-sm small">
                <thead className="table-secondary sticky-top">
                  <tr><th>ID</th><th>DATE</th><th>TOTAL</th><th>SHARE</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td className="fw-bold">#{h.id}</td>
                      <td>{h.date}</td>
                      <td className="fw-black">${h.total.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-sm text-success" onClick={()=>{setLastTicket(generateTicket(h.id)); handleShare('wa');}}>
                          <i className="bi bi-whatsapp"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <div className="text-center py-5 text-muted">No records found.</div>}
            </div>
            <div className="p-3 border-top bg-light">
              <button className="btn btn-dark w-100 rounded-pill fw-bold" onClick={()=>setShowHistory(false)}>CLOSE REPOSITORY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
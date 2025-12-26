
import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS, TABLES, USERS, CONTACT_NUMBER } from './constants';

interface CartItem {
  id: number;
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
  
  // Tax and Service Charge States
  const [vatRate, setVatRate] = useState<number>(0);
  const [serviceRate, setServiceRate] = useState<number>(0);
  const [vipRate, setVipRate] = useState<number>(10);
  
  // Dine-in states
  const [dineIn, setDineIn] = useState({ customer: '', user: 'user0', table: 'table0', vip: 0 });
  // Take-away states
  const [takeaway, setTakeaway] = useState({ 
    name: '', 
    lastName: '', 
    address: '', 
    phone: '',
    bookingDate: '',
    bookingTime: ''
  });

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [currentOrderMessage, setCurrentOrderMessage] = useState('');

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

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  // Dynamic Calculations - Only apply VAT/Service if Dine-in
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const vatAmount = orderType === 'Dine-in' ? subtotal * (vatRate / 100) : 0;
  const serviceAmount = orderType === 'Dine-in' ? subtotal * (serviceRate / 100) : 0;
  const vipCharge = orderType === 'Dine-in' ? dineIn.vip * vipRate : 0;
  const grandTotal = subtotal + vatAmount + serviceAmount + vipCharge;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleAdminAction = (action: () => void) => {
    const pw = prompt('Admin Password Required:');
    if (pw === 'admin') action();
    else alert('Invalid Password');
  };

  const formatOrderMessage = (orderId: number) => {
    let msg = `🍔 *QUICKBITE ORDER TICKET*\n`;
    msg += `------------------------------\n`;
    msg += `🎟️ Order ID: ${orderId}\n`;
    msg += `📅 Ordered On: ${time.toLocaleDateString()}\n`;
    msg += `⏰ Ordered At: ${time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })}\n`;
    
    if (orderType === 'Take-away' && takeaway.bookingDate) {
      msg += `📢 *BOOKING SCHEDULE:*\n`;
      msg += `📅 Date: ${takeaway.bookingDate}\n`;
      msg += `⏰ Time: ${takeaway.bookingTime || 'N/A'}\n`;
    }
    
    msg += `------------------------------\n`;
    if (orderType === 'Take-away') {
      msg += `👤 Customer: ${takeaway.name} ${takeaway.lastName}\n`;
      msg += `📍 Address: ${takeaway.address}\n`;
      msg += `📞 Phone: ${takeaway.phone}\n`;
    } else {
      msg += `🪑 Table: ${dineIn.table} | 👤 User: ${dineIn.user}\n`;
      msg += `👥 VIP Guests: ${dineIn.vip}\n`;
    }
    msg += `------------------------------\n`;
    msg += `📝 *ITEMS:*\n`;
    cart.forEach(i => {
      msg += `• ${i.name} [x${i.quantity}] - $${(i.price * i.quantity).toFixed(2)}\n`;
    });
    msg += `------------------------------\n`;
    msg += `💵 Subtotal: $${subtotal.toFixed(2)}\n`;
    if (orderType === 'Dine-in') {
      if (vatRate > 0) msg += `⚖️ VAT (${vatRate}%): $${vatAmount.toFixed(2)}\n`;
      if (serviceRate > 0) msg += `🛎️ Service (${serviceRate}%): $${serviceAmount.toFixed(2)}\n`;
      if (vipCharge > 0) msg += `💎 VIP Charge: $${vipCharge.toFixed(2)}\n`;
    }
    msg += `💰 *TOTAL: $${grandTotal.toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `✅ *Fastfood Verification Code: ${Math.floor(1000 + Math.random() * 9000)}*`;
    return msg;
  };

  const handleShare = (platform: 'wa' | 'tg' | 'vb') => {
    const encoded = encodeURIComponent(currentOrderMessage);
    const cleanNum = CONTACT_NUMBER.replace(/\+/g, '');

    if (platform === 'wa') {
      window.open(`https://wa.me/${cleanNum}?text=${encoded}`, '_blank');
    } else if (platform === 'tg') {
      window.open(`https://t.me/share/url?url=${encoded}`, '_blank');
    } else if (platform === 'vb') {
      window.open(`viber://forward?text=${encoded}`, '_blank');
    }
    
    setShowAppSelector(false);
    setCart([]);
    setTakeaway({ name: '', lastName: '', address: '', phone: '', bookingDate: '', bookingTime: '' });
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert('Cart is empty!');

    const orderId = Date.now();
    const orderData = {
      id: orderId,
      time: time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }),
      date: time.toLocaleDateString(),
      items: cart,
      total: grandTotal,
      type: orderType,
      details: orderType === 'Dine-in' ? dineIn : takeaway
    };

    setHistory(prev => [orderData, ...prev].slice(0, 10000));

    if (orderType === 'Take-away') {
      const message = formatOrderMessage(orderId);
      setCurrentOrderMessage(message);
      setShowAppSelector(true);
    } else {
      window.print();
      alert('Order placed successfully! Printing ticket...');
      setCart([]);
    }
  };

  const downloadCSV = () => {
    const headers = "ID,Date,Time,Type,Total\n";
    const rows = history.map(h => `${h.id},${h.date},${h.time},${h.type},${h.total}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order_history.csv';
    link.click();
  };

  return (
    <div className="main-wrapper">
      <div className="bg-dark text-white text-center py-2 fw-bold text-uppercase shadow-sm">
        QuickBite FastFood & Restaurant
      </div>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm">
        <div className="container-fluid">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="#">About</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Staff</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Content</a></li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <div id="google_translate_element" className="translate-widget"></div>
            <button onClick={toggleFullscreen} className="btn btn-outline-light btn-sm">
              <i className="bi bi-arrows-fullscreen"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-white border-bottom p-2 d-flex flex-wrap gap-2 align-items-center shadow-sm">
        <button className="btn btn-light border"><i className="bi bi-house"></i></button>
        <button className="btn btn-primary fw-bold px-4" onClick={() => setCart([])}>NEW ORDER</button>
        <button className="btn btn-secondary btn-sm">B1</button>
        <button className="btn btn-secondary btn-sm">B2</button>
        <button className="btn btn-secondary btn-sm">B3</button>
        <button className="btn btn-secondary btn-sm">B4</button>
        <div className="input-group ms-auto" style={{ maxWidth: '300px' }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="content-area">
        <div className="category-sidebar">
          <button 
            className={`category-btn ${category === 'All' ? 'active' : ''}`}
            onClick={() => setCategory('All')}
          >All</button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`category-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >{cat}</button>
          ))}
        </div>

        <div className="item-grid">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredItems.map(item => (
              <div key={item.id} className="col">
                <div className="card menu-card">
                  <img src={item.img} className="card-img-top" alt={item.name} />
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title fw-bold mb-1">{item.name}</h6>
                    <p className="card-text text-primary fw-bold">${item.price.toFixed(2)}</p>
                    <button 
                      className="btn btn-outline-primary btn-sm mt-auto"
                      onClick={() => addToCart(item)}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="p-2 d-flex gap-1 bg-white border-bottom shadow-sm">
            <button 
              className={`btn flex-fill fw-bold btn-sm ${orderType === 'Take-away' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setOrderType('Take-away')}
            >Take-away</button>
            <button 
              className={`btn flex-fill fw-bold btn-sm ${orderType === 'Dine-in' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setOrderType('Dine-in')}
            >Dine-in</button>
          </div>

          <div className="cart-items">
            <div className="mb-3">
              {orderType === 'Take-away' ? (
                <div className="row g-1">
                  <div className="col-6"><input className="form-control form-control-sm mb-1" placeholder="First Name" value={takeaway.name} onChange={e=>setTakeaway({...takeaway, name: e.target.value})}/></div>
                  <div className="col-6"><input className="form-control form-control-sm mb-1" placeholder="Last Name" value={takeaway.lastName} onChange={e=>setTakeaway({...takeaway, lastName: e.target.value})}/></div>
                  <div className="col-12"><input className="form-control form-control-sm mb-1" placeholder="Address" value={takeaway.address} onChange={e=>setTakeaway({...takeaway, address: e.target.value})}/></div>
                  <div className="col-12"><input className="form-control form-control-sm mb-2" placeholder="Phone" value={takeaway.phone} onChange={e=>setTakeaway({...takeaway, phone: e.target.value})}/></div>
                  
                  {/* Booking Fields for Take-away */}
                  <div className="col-12 bg-white p-2 rounded border border-primary-subtle shadow-sm mb-1">
                    <label className="fw-bold text-primary small mb-1"><i className="bi bi-calendar-event me-1"></i> Booking for Future?</label>
                    <div className="row g-1">
                      <div className="col-6"><input type="date" className="form-control form-control-sm" value={takeaway.bookingDate} onChange={e=>setTakeaway({...takeaway, bookingDate: e.target.value})}/></div>
                      <div className="col-6"><input type="time" className="form-control form-control-sm" value={takeaway.bookingTime} onChange={e=>setTakeaway({...takeaway, bookingTime: e.target.value})}/></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row g-1">
                  <div className="col-12"><input className="form-control form-control-sm mb-1" placeholder="Customer Name" value={dineIn.customer} onChange={e=>setDineIn({...dineIn, customer: e.target.value})}/></div>
                  <div className="col-6">
                    <select className="form-select form-select-sm" value={dineIn.user} onChange={e=>setDineIn({...dineIn, user: e.target.value})}>
                      <option value="user0">user0</option>
                      {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select className="form-select form-select-sm" value={dineIn.table} onChange={e=>setDineIn({...dineIn, table: e.target.value})}>
                      <option value="table0">table0</option>
                      {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {cart.map(item => (
              <div key={item.id} className="bg-white p-2 rounded mb-2 shadow-sm border border-warning-subtle">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-bold small">{item.name}</span>
                  <span className="fw-bold text-success">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <button className="btn btn-light btn-sm border" onClick={() => updateQty(item.id, -1)}>-</button>
                  <input className="form-control form-control-sm text-center" style={{ width: '45px' }} value={item.quantity} readOnly />
                  <button className="btn btn-light btn-sm border" onClick={() => updateQty(item.id, 1)}>+</button>
                  <button className="btn btn-danger btn-sm ms-auto" onClick={() => removeFromCart(item.id)}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            ))}

            {orderType === 'Dine-in' && (
              <div className="bg-white p-2 rounded mb-2 shadow-sm border border-warning-subtle">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small fw-bold">VIP Guests Count</span>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-light btn-sm border" onClick={() => setDineIn({...dineIn, vip: Math.max(0, dineIn.vip - 1)})}>-</button>
                    <span className="fw-bold">{dineIn.vip}</span>
                    <button className="btn btn-light btn-sm border" onClick={() => setDineIn({...dineIn, vip: dineIn.vip + 1})}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-top shadow">
            {/* Conditional VAT/Service Inputs - Only for Dine-in */}
            {orderType === 'Dine-in' && (
              <div className="row g-1 mb-3 bg-light p-2 rounded border border-warning-subtle animate__animated animate__fadeIn">
                <div className="col-6">
                  <label className="small fw-bold d-block text-center" style={{fontSize: '9px'}}>VAT (%)</label>
                  <input type="number" className="form-control form-control-sm text-center" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="small fw-bold d-block text-center" style={{fontSize: '9px'}}>SERVICE (%)</label>
                  <input type="number" className="form-control form-control-sm text-center" value={serviceRate} onChange={(e) => setServiceRate(Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between small opacity-75"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            {orderType === 'Dine-in' && (
              <>
                <div className="d-flex justify-content-between small opacity-75"><span>VAT ({vatRate}%):</span><span>${vatAmount.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between small opacity-75"><span>Service ({serviceRate}%):</span><span>${serviceAmount.toFixed(2)}</span></div>
                {vipCharge > 0 && <div className="d-flex justify-content-between small text-primary"><span>VIP Charge (${vipRate}/p):</span><span>${vipCharge.toFixed(2)}</span></div>}
              </>
            )}
            <div className="d-flex justify-content-between h4 fw-black mt-2 text-dark"><span>TOTAL:</span><span>${grandTotal.toFixed(2)}</span></div>
            
            <div className="row g-2 mt-2">
              <div className="col-6"><button className="btn btn-danger w-100 fw-bold py-2" onClick={() => setCart([])}>CANCEL</button></div>
              <div className="col-6"><button className="btn btn-success w-100 fw-bold py-2" onClick={() => placeOrder()}>PLACE ORDER</button></div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-success text-white px-3 py-1 d-flex justify-content-between align-items-center">
        <div className="small fw-bold">
          <i className="bi bi-clock me-1"></i>
          {time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })} London, UK
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-dark btn-sm" onClick={() => handleAdminAction(() => setShowHistory(true))}>History</button>
          <button className="btn btn-dark btn-sm" onClick={() => handleAdminAction(downloadCSV)}>Download CSV</button>
        </div>
      </footer>
      <div className="bg-light text-center py-1 border-top" style={{ fontSize: '10px' }}>
        Fast Food Static POS System © 2024. All rights reserved.
      </div>

      {showHistory && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded p-4 w-75 h-75 overflow-auto shadow-lg">
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-bold">Order History (Last 10k)</h5>
              <button className="btn-close" onClick={() => setShowHistory(false)}></button>
            </div>
            <table className="table table-sm table-striped small">
              <thead className="table-dark">
                <tr><th>ID</th><th>Date</th><th>Time</th><th>Type</th><th>Total</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}><td>{h.id}</td><td>{h.date}</td><td>{h.time}</td><td>{h.type}</td><td>${h.total.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAppSelector && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-85 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded-4 shadow-2xl p-4 w-auto text-center animate__animated animate__zoomIn" style={{ minWidth: '320px' }}>
            <h5 className="fw-bold mb-4 text-primary">SELECT SENDING APP</h5>
            <p className="small text-muted mb-4">Sharing ticket to: <b>{CONTACT_NUMBER}</b></p>
            <div className="d-grid gap-3">
              <button className="btn btn-success py-3 d-flex align-items-center justify-content-center gap-2 fw-bold" onClick={() => handleShare('wa')}>
                <i className="bi bi-whatsapp fs-4"></i> WhatsApp
              </button>
              <button className="btn btn-primary py-3 d-flex align-items-center justify-content-center gap-2 fw-bold" onClick={() => handleShare('tg')}>
                <i className="bi bi-telegram fs-4"></i> Telegram
              </button>
              <button className="btn btn-info text-white py-3 d-flex align-items-center justify-content-center gap-2 fw-bold" onClick={() => handleShare('vb')}>
                <i className="bi bi-chat-dots-fill fs-4"></i> Viber
              </button>
            </div>
            <hr className="my-4" />
            <button className="btn btn-outline-secondary w-100 fw-bold" onClick={() => setShowAppSelector(false)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

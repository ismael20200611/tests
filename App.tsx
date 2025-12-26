
import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS, TABLES, USERS, CONTACT_NUMBER, COMPANY_EMAIL } from './constants';

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
  
  const [vatRate, setVatRate] = useState<number>(0);
  const [serviceRate, setServiceRate] = useState<number>(0);
  const [vipRate] = useState<number>(10);
  
  const [dineIn, setDineIn] = useState({ customer: '', user: 'user1', table: 'T1', vip: 0 });
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

  const removeFromCart = (id: string | number) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const vatAmount = orderType === 'Dine-in' ? subtotal * (vatRate / 100) : 0;
  const serviceAmount = orderType === 'Dine-in' ? subtotal * (serviceRate / 100) : 0;
  const vipCharge = orderType === 'Dine-in' ? dineIn.vip * vipRate : 0;
  const grandTotal = subtotal + vatAmount + serviceAmount + vipCharge;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const handleAdminAction = (action: () => void) => {
    const pw = prompt('Admin Password Required:');
    if (pw === 'admin') action();
    else alert('Invalid Password');
  };

  const formatOrderMessage = (orderId: number) => {
    let msg = `🍔 *QUICKBITE UK ORDER TICKET*\n`;
    msg += `------------------------------\n`;
    msg += `🎟️ Order ID: ${orderId}\n`;
    msg += `📅 Date: ${time.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })}\n`;
    msg += `⏰ Time: ${time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })}\n`;
    
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
      msg += `🪑 Table: ${dineIn.table} | 👤 Staff: ${dineIn.user}\n`;
      msg += `👥 VIP Guests: ${dineIn.vip}\n`;
    }
    msg += `------------------------------\n`;
    msg += `📝 *ITEMS:*\n`;
    cart.forEach(i => {
      msg += `• ${i.name} [x${i.quantity}] - £${(i.price * i.quantity).toFixed(2)}\n`;
    });
    msg += `------------------------------\n`;
    msg += `💵 Subtotal: £${subtotal.toFixed(2)}\n`;
    if (orderType === 'Dine-in') {
      if (vatRate > 0) msg += `⚖️ VAT (${vatRate}%): £${vatAmount.toFixed(2)}\n`;
      if (serviceRate > 0) msg += `🛎️ Service (${serviceRate}%): £${serviceAmount.toFixed(2)}\n`;
      if (vipCharge > 0) msg += `💎 VIP Charge: £${vipCharge.toFixed(2)}\n`;
    }
    msg += `💰 *TOTAL: £${grandTotal.toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `✅ *Verification Code: ${Math.floor(1000 + Math.random() * 9000)}*`;
    return msg;
  };

  const handleShare = (platform: 'wa' | 'tg' | 'vb' | 'email') => {
    const orderId = Date.now();
    const message = formatOrderMessage(orderId);
    const encoded = encodeURIComponent(message);
    const cleanNum = CONTACT_NUMBER.replace(/\+/g, '');

    if (platform === 'wa') window.open(`https://wa.me/${cleanNum}?text=${encoded}`, '_blank');
    else if (platform === 'tg') window.open(`https://t.me/share/url?url=${encoded}`, '_blank');
    else if (platform === 'vb') window.open(`viber://forward?text=${encoded}`, '_blank');
    else if (platform === 'email') window.open(`mailto:${COMPANY_EMAIL}?subject=QuickBite Order ${orderId}&body=${encoded}`, '_blank');
    
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
      date: time.toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
      items: [...cart],
      total: grandTotal,
      type: orderType,
      details: orderType === 'Dine-in' ? {...dineIn} : {...takeaway}
    };

    setHistory(prev => [orderData, ...prev].slice(0, 10000));

    if (orderType === 'Take-away') {
      const message = formatOrderMessage(orderId);
      setCurrentOrderMessage(message);
      setShowAppSelector(true);
    } else {
      window.print();
      alert('Dine-in Order Registered! Printing receipt...');
      setCart([]);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'All': return 'bi-grid-fill';
      case 'Shawarma': return 'bi-fire';
      case 'Pizza': return 'bi-pie-chart-fill';
      case 'Grill': return 'bi-thermometer-sun';
      case 'Platter': return 'bi-collection-fill';
      case 'Sides': return 'bi-box-seam-fill';
      case 'Drinks': return 'bi-cup-straw';
      default: return 'bi-lightning-fill';
    }
  };

  return (
    <div className="main-wrapper">
      <div className="bg-dark text-white text-center py-2 fw-bold text-uppercase small shadow-sm" style={{ height: 'var(--brand-height)' }}>
        <i className="bi bi-shop text-warning me-2"></i>
        QuickBite POS System v2.1 (UK Edition)
      </div>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm" style={{ height: 'var(--nav-height)' }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-black"><i className="bi bi-lightning-charge-fill me-2 text-warning"></i>QUICKBITE UK</span>
          <div className="d-flex align-items-center gap-3">
            <div id="google_translate_element"></div>
            <button onClick={toggleFullscreen} className="btn btn-outline-light btn-sm rounded-circle shadow-sm">
              <i className="bi bi-arrows-fullscreen"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-white border-bottom p-2 d-flex gap-2 align-items-center shadow-sm" style={{ height: 'var(--action-height)' }}>
        <button className="btn btn-light border shadow-sm" onClick={() => { setCategory('All'); setSearch(''); }}>
          <i className="bi bi-house-door-fill"></i>
        </button>
        <button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={() => { if(confirm('Clear current order?')) setCart([]); }}>
          NEW ORDER
        </button>
        <div className="input-group ms-auto shadow-sm" style={{ maxWidth: '350px' }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input 
            type="text" 
            className="form-control border-start-0 shadow-none" 
            placeholder="Search for food items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="content-area">
        <div className="category-sidebar">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`category-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              <i className={`bi ${getCategoryIcon(cat)}`}></i>
              {cat}
            </button>
          ))}
        </div>

        <div className="item-grid">
          <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-4 animate__animated animate__fadeIn">
            {filteredItems.map(item => (
              <div key={item.id} className="col">
                <div className="card menu-card shadow-sm border-0">
                  <img src={(item as any).img || (item as any).image} className="card-img-top" alt={item.name} />
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title fw-bold mb-1 text-truncate">{item.name}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                      <span className="badge bg-light text-primary border rounded-pill x-small">{item.category}</span>
                      <span className="fw-black text-dark fs-5">£{item.price.toFixed(2)}</span>
                    </div>
                    {/* Add to Cart Button Restored */}
                    <button 
                      className="btn btn-primary w-100 fw-bold btn-sm shadow-sm mt-auto py-2"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                    >
                      <i className="bi bi-plus-circle-fill me-2"></i> ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="order-type-tabs">
            <button 
              className={`btn btn-sm shadow-sm ${orderType === 'Dine-in' ? 'btn-primary' : 'btn-outline-primary border-0'}`}
              onClick={() => setOrderType('Dine-in')}
            >
              <i className="bi bi-people-fill me-1"></i> DINE-IN
            </button>
            <button 
              className={`btn btn-sm shadow-sm ${orderType === 'Take-away' ? 'btn-warning' : 'btn-outline-warning border-0'}`}
              onClick={() => setOrderType('Take-away')}
            >
              <i className="bi bi-bag-heart-fill me-1"></i> TAKE-AWAY
            </button>
          </div>

          <div className="cart-items-container">
            <div className="mb-3 animate__animated animate__fadeIn">
              {orderType === 'Take-away' ? (
                <div className="row g-1">
                  <div className="col-6"><input className="form-control form-control-sm" placeholder="First Name" value={takeaway.name} onChange={e=>setTakeaway({...takeaway, name: e.target.value})}/></div>
                  <div className="col-6"><input className="form-control form-control-sm" placeholder="Last Name" value={takeaway.lastName} onChange={e=>setTakeaway({...takeaway, lastName: e.target.value})}/></div>
                  <div className="col-12 mt-1"><input className="form-control form-control-sm" placeholder="Contact Phone" value={takeaway.phone} onChange={e=>setTakeaway({...takeaway, phone: e.target.value})}/></div>
                  <div className="col-12 mt-1"><input className="form-control form-control-sm" placeholder="Delivery Address" value={takeaway.address} onChange={e=>setTakeaway({...takeaway, address: e.target.value})}/></div>
                  <div className="col-12 mt-2 bg-light p-2 rounded border border-warning-subtle shadow-sm">
                    <label className="fw-bold text-dark x-small d-block mb-1" style={{fontSize: '10px'}}><i className="bi bi-calendar-event me-1"></i> PRE-BOOK FOR PARTY / EVENTS?</label>
                    <div className="row g-1">
                      <div className="col-6"><input type="date" className="form-control form-control-sm" value={takeaway.bookingDate} onChange={e=>setTakeaway({...takeaway, bookingDate: e.target.value})}/></div>
                      <div className="col-6"><input type="time" className="form-control form-control-sm" value={takeaway.bookingTime} onChange={e=>setTakeaway({...takeaway, bookingTime: e.target.value})}/></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row g-1">
                  <div className="col-12"><input className="form-control form-control-sm" placeholder="Customer Name" value={dineIn.customer} onChange={e=>setDineIn({...dineIn, customer: e.target.value})}/></div>
                  <div className="col-6 mt-1">
                    <select className="form-select form-select-sm" value={dineIn.user} onChange={e=>setDineIn({...dineIn, user: e.target.value})}>
                      {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-6 mt-1">
                    <select className="form-select form-select-sm" value={dineIn.table} onChange={e=>setDineIn({...dineIn, table: e.target.value})}>
                      {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {/* VIP Count for Dine-in moved here, directly below User/Table selection */}
                  <div className="col-12 mt-2 bg-light p-2 rounded border shadow-sm d-flex justify-content-between align-items-center">
                    <span className="fw-bold small text-primary"><i className="bi bi-gem me-1"></i> VIP Guest Count</span>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-outline-primary btn-sm p-0 px-2" onClick={() => setDineIn({...dineIn, vip: Math.max(0, dineIn.vip - 1)})}>-</button>
                      <span className="fw-black">{dineIn.vip}</span>
                      <button className="btn btn-outline-primary btn-sm p-0 px-2" onClick={() => setDineIn({...dineIn, vip: dineIn.vip + 1})}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-5 opacity-50">
                <i className="bi bi-cart-x fs-1 d-block mb-2 text-muted"></i>
                <p className="fw-bold">No items in your basket</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white p-2 rounded border mb-2 shadow-sm animate__animated animate__fadeInRight">
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold small text-truncate" style={{maxWidth: '180px'}}>{item.name}</span>
                    <span className="fw-black text-success">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 mt-2">
                    <button className="btn btn-outline-secondary btn-sm p-0 px-2 shadow-none" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="px-2 fw-bold">{item.quantity}</span>
                    <button className="btn btn-outline-secondary btn-sm p-0 px-2 shadow-none" onClick={() => updateQty(item.id, 1)}>+</button>
                    <button className="btn btn-link text-danger btn-sm ms-auto p-0" onClick={() => removeFromCart(item.id)}>
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary-fixed">
            {orderType === 'Dine-in' && (
              <div className="row g-2 mb-3 bg-light p-2 rounded border animate__animated animate__fadeIn">
                <div className="col-6">
                  <label className="fw-bold d-block text-center mb-1" style={{fontSize: '9px', color: '#64748b'}}>VAT (%)</label>
                  <input type="number" className="form-control form-control-sm text-center shadow-none" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="fw-bold d-block text-center mb-1" style={{fontSize: '9px', color: '#64748b'}}>SERVICE (%)</label>
                  <input type="number" className="form-control form-control-sm text-center shadow-none" value={serviceRate} onChange={(e) => setServiceRate(Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="px-1">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              {orderType === 'Dine-in' && (
                <>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>VAT ({vatRate}%)</span>
                    <span>£{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Service ({serviceRate}%)</span>
                    <span>£{serviceAmount.toFixed(2)}</span>
                  </div>
                  {vipCharge > 0 && (
                    <div className="d-flex justify-content-between small text-primary mb-1">
                      <span>VIP Charge (£{vipRate}/p)</span>
                      <span>£{vipCharge.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <span className="h5 fw-black mb-0">TOTAL</span>
                <span className="h4 fw-black mb-0 text-primary">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="row g-2 mt-3">
              <div className="col-5">
                <button className="btn btn-outline-danger w-100 fw-bold py-2 shadow-sm" onClick={() => { if(confirm('Cancel order?')) setCart([]); }}>
                  CANCEL
                </button>
              </div>
              <div className="col-7">
                <button className="btn btn-success w-100 fw-black py-2 shadow-sm" onClick={placeOrder}>
                  PLACE ORDER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-success text-white px-3 py-1 d-flex justify-content-between align-items-center" style={{ height: 'var(--footer-height)' }}>
        <div className="x-small fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-clock-fill"></i>
          {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/London' })} (London, UK)
        </div>
        <div className="d-flex gap-3">
          <button className="btn btn-link text-white p-0 text-decoration-none x-small fw-bold" onClick={() => handleAdminAction(() => setShowHistory(true))} style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-clock-history me-1"></i> HISTORY
          </button>
          <button className="btn btn-link text-white p-0 text-decoration-none x-small fw-bold" onClick={() => handleAdminAction(() => {})} style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> EXPORT
          </button>
        </div>
      </footer>

      {showAppSelector && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded-4 shadow-lg p-4 w-auto text-center animate__animated animate__zoomIn" style={{ minWidth: '380px' }}>
            <div className="mb-3 text-primary"><i className="bi bi-send-fill fs-1"></i></div>
            <h5 className="fw-black mb-4">SHARE TICKET</h5>
            <div className="d-grid gap-2">
              <button className="btn btn-success py-3 d-flex align-items-center justify-content-center gap-3 fw-bold shadow-sm" onClick={() => handleShare('wa')}>
                <i className="bi bi-whatsapp fs-3"></i> WHATSAPP
              </button>
              <button className="btn btn-primary py-3 d-flex align-items-center justify-content-center gap-3 fw-bold shadow-sm" onClick={() => handleShare('tg')}>
                <i className="bi bi-telegram fs-3"></i> TELEGRAM
              </button>
              <button className="btn btn-info text-white py-3 d-flex align-items-center justify-content-center gap-3 fw-bold shadow-sm" onClick={() => handleShare('vb')}>
                <i className="bi bi-chat-dots-fill fs-3"></i> VIBER
              </button>
              <button className="btn btn-dark py-3 d-flex align-items-center justify-content-center gap-3 fw-bold shadow-sm" onClick={() => handleShare('email')}>
                <i className="bi bi-envelope-at fs-3"></i> EMAIL
              </button>
            </div>
            <hr className="my-4" />
            <button className="btn btn-outline-secondary w-100 fw-bold border-0" onClick={() => setShowAppSelector(false)}>
              SKIP
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-85 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded-4 p-4 w-75 h-75 overflow-hidden d-flex flex-column shadow-2xl animate__animated animate__fadeInUp">
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-black"><i className="bi bi-journal-text me-2"></i>History Registry (London)</h5>
              <button className="btn-close" onClick={() => setShowHistory(false)}></button>
            </div>
            <div className="overflow-auto flex-fill">
              <table className="table table-hover table-striped small align-middle">
                <thead className="table-primary position-sticky top-0">
                  <tr><th>ID</th><th>DATE</th><th>TIME</th><th>TYPE</th><th>TOTAL</th><th>PRINTER</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td className="fw-bold text-muted">#{h.id.toString().slice(-6)}</td>
                      <td>{h.date}</td>
                      <td>{h.time}</td>
                      <td><span className={`badge ${h.type === 'Dine-in' ? 'bg-primary' : 'bg-warning text-dark'}`}>{h.type}</span></td>
                      <td className="fw-black text-success">£{h.total.toFixed(2)}</td>
                      <td><button className="btn btn-sm btn-outline-dark p-1 px-2 border-0"><i className="bi bi-printer-fill"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

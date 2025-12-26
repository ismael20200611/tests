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
  
  // Mobile Toggles
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  
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

  const exportToCSV = () => {
    if (history.length === 0) return alert('No history data to export.');
    
    // NO HEADERS AS REQUESTED - ONLY DATA
    const rows = history.map(h => {
      const details = h.details;
      return [
        h.id,
        h.date,
        h.time,
        h.type,
        h.total.toFixed(2),
        h.type === 'Dine-in' ? details.customer : `${details.name} ${details.lastName}`,
        h.type === 'Dine-in' ? details.user : 'N/A',
        h.type === 'Dine-in' ? details.table : 'Takeaway',
        h.type === 'Dine-in' ? details.vip : '0'
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    msg += `------------------------------\n`;
    if (orderType === 'Take-away') {
      msg += `👤 Customer: ${takeaway.name} ${takeaway.lastName}\n`;
      msg += `📞 Phone: ${takeaway.phone}\n`;
    } else {
      msg += `🪑 Table: ${dineIn.table} | 👥 VIP: ${dineIn.vip}\n`;
    }
    msg += `------------------------------\n`;
    cart.forEach(i => {
      msg += `• ${i.name} [x${i.quantity}] - £${(i.price * i.quantity).toFixed(2)}\n`;
    });
    msg += `------------------------------\n`;
    msg += `💰 *TOTAL: £${grandTotal.toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `✅ *Code: ${Math.floor(1000 + Math.random() * 9000)}*`;
    return msg;
  };

  const handleShare = (platform: 'wa' | 'tg' | 'vb' | 'email') => {
    const orderId = Date.now();
    const message = formatOrderMessage(orderId);
    const encoded = encodeURIComponent(message);
    const cleanNum = CONTACT_NUMBER.replace(/\+/g, '');

    if (platform === 'wa') window.open(`https://wa.me/${cleanNum}?text=${encoded}`, '_blank');
    else if (platform === 'tg') window.open(`https://t.me/share/url?url=${encoded}`, '_blank');
    else if (platform === 'email') window.open(`mailto:${COMPANY_EMAIL}?subject=Order ${orderId}&body=${encoded}`, '_blank');
    
    setShowAppSelector(false);
    setCart([]);
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert('Basket empty!');
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
      setShowAppSelector(true);
    } else {
      window.print();
      setCart([]);
    }
  };

  return (
    <div className="main-wrapper">
      {/* HEADER - ALWAYS VISIBLE */}
      <header className="brand-header p-2 shadow-sm d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button className="btn btn-dark btn-sm d-md-none me-2" onClick={() => setShowMobileCategories(!showMobileCategories)}>
            <i className="bi bi-list fs-5"></i>
          </button>
          <i className="bi bi-shop text-warning me-2 fs-5"></i>
          <span className="fw-bold text-uppercase">QuickBite UK</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div id="google_translate_element" className="d-none d-sm-block"></div>
          <button className="btn btn-dark btn-sm d-md-none" onClick={() => setShowMobileCart(true)}>
            <i className="bi bi-cart3 fs-5"></i>
            {cart.length > 0 && <span className="badge bg-danger ms-1">{cart.length}</span>}
          </button>
        </div>
      </header>

      {/* DESKTOP NAV */}
      <nav className="nav-desktop p-2 text-white d-none d-md-flex align-items-center">
        <span className="fw-bold small"><i className="bi bi-lightning-charge-fill me-1"></i>TERMINAL ACTIVE</span>
        <button onClick={toggleFullscreen} className="btn btn-sm btn-link text-white ms-auto">
          <i className="bi bi-arrows-fullscreen"></i>
        </button>
      </nav>

      {/* ACTION BAR */}
      <div className="action-bar p-2 d-flex gap-2 align-items-center">
        <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => { if(confirm('New order?')) setCart([]); }}>
          NEW ORDER
        </button>
        <div className="input-group input-group-sm flex-grow-1" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)}/>
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
              <i className={`bi ${cat === 'All' ? 'bi-grid' : cat === 'Shawarma' ? 'bi-fire' : cat === 'Pizza' ? 'bi-pie-chart' : cat === 'Grill' ? 'bi-thermometer-sun' : cat === 'Platter' ? 'bi-collection' : cat === 'Sides' ? 'bi-box-seam' : 'bi-cup-straw'}`}></i>
              <span>{cat}</span>
            </button>
          ))}
          {showMobileCategories && <button className="btn btn-danger btn-sm m-2 d-md-none" onClick={()=>setShowMobileCategories(false)}>CLOSE</button>}
        </aside>

        {/* Menu Items Grid */}
        <section className="item-grid" onClick={() => setShowMobileCategories(false)}>
          <div className="row row-cols-2 row-cols-lg-4 g-2 g-md-3">
            {filteredItems.map(item => (
              <div key={item.id} className="col">
                <div className="card menu-card h-100">
                  <img src={(item as any).img || (item as any).image} className="card-img-top" alt={item.name} />
                  <div className="card-body p-2 d-flex flex-column">
                    <h6 className="card-title small fw-bold mb-1 text-truncate">{item.name}</h6>
                    <p className="fw-black mb-2">£{item.price.toFixed(2)}</p>
                    <button className="btn btn-primary btn-sm mt-auto fw-bold" onClick={()=>handleAddToCart(item)}>
                      + ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart Sidebar */}
        <aside className={`cart-sidebar ${showMobileCart ? 'show-mobile' : ''}`}>
          <div className="p-2 border-bottom d-flex gap-2">
            {showMobileCart && <button className="btn btn-sm btn-light border d-md-none" onClick={()=>setShowMobileCart(false)}><i className="bi bi-chevron-left"></i></button>}
            <button className={`btn btn-sm flex-fill ${orderType === 'Dine-in' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setOrderType('Dine-in')}>DINE-IN</button>
            <button className={`btn btn-sm flex-fill ${orderType === 'Take-away' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={()=>setOrderType('Take-away')}>TAKE-AWAY</button>
          </div>

          <div className="flex-grow-1 overflow-auto p-2">
            {/* Customer Inputs */}
            <div className="mb-3">
              {orderType === 'Take-away' ? (
                <div className="row g-1">
                  <div className="col-12"><input className="form-control form-control-sm" placeholder="Name" value={takeaway.name} onChange={e=>setTakeaway({...takeaway, name: e.target.value})}/></div>
                  <div className="col-12 mt-1"><input className="form-control form-control-sm" placeholder="Phone" value={takeaway.phone} onChange={e=>setTakeaway({...takeaway, phone: e.target.value})}/></div>
                </div>
              ) : (
                <div className="row g-1">
                  <div className="col-12"><input className="form-control form-control-sm" placeholder="Cust. Name" value={dineIn.customer} onChange={e=>setDineIn({...dineIn, customer: e.target.value})}/></div>
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
                  <div className="col-12 mt-2 bg-light p-2 rounded border small d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">VIP Guests</span>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-outline-primary btn-sm p-0 px-2" onClick={()=>setDineIn({...dineIn, vip: Math.max(0, dineIn.vip-1)})}>-</button>
                      <span className="fw-bold">{dineIn.vip}</span>
                      <button className="btn btn-outline-primary btn-sm p-0 px-2" onClick={()=>setDineIn({...dineIn, vip: dineIn.vip+1})}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr />

            {cart.length === 0 ? (
              <div className="text-center py-5 opacity-25"><i className="bi bi-basket fs-1"></i></div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-light p-2 rounded mb-2 border shadow-sm small animate__animated animate__fadeInRight">
                  <div className="d-flex justify-content-between fw-bold">
                    <span className="text-truncate" style={{maxWidth: '150px'}}>{item.name}</span>
                    <span className="text-success">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="d-flex align-items-center mt-1">
                    <button className="btn btn-sm btn-outline-secondary p-0 px-2" onClick={()=>updateQty(item.id, -1)}>-</button>
                    <span className="mx-2">{item.quantity}</span>
                    <button className="btn btn-sm btn-outline-secondary p-0 px-2" onClick={()=>updateQty(item.id, 1)}>+</button>
                    <button className="btn btn-link text-danger btn-sm ms-auto p-0" onClick={()=>removeFromCart(item.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TOTALS BAR */}
          <div className="p-3 border-top bg-white">
            <div className="d-flex justify-content-between h4 fw-black text-primary mb-3">
              <span>TOTAL</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
            <div className="row g-1">
              <div className="col-4">
                <button className="btn btn-outline-danger w-100 btn-sm py-2" onClick={()=>{if(confirm('Clear?')) setCart([])}}>CANCEL</button>
              </div>
              <div className="col-8">
                <button className="btn btn-success w-100 btn-sm py-2 fw-bold" onClick={placeOrder}>PLACE ORDER</button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER - ALWAYS VISIBLE */}
      <footer className="status-footer p-1 px-3 d-flex justify-content-between align-items-center">
        <div className="small fw-bold">
          <i className="bi bi-clock-fill me-1"></i>
          {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/London' })}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-link text-white text-decoration-none p-0 small fw-bold" onClick={()=>handleAdminAction(()=>setShowHistory(true))}>
            HISTORY
          </button>
          <span className="text-white-50">|</span>
          <button className="btn btn-link text-white text-decoration-none p-0 small fw-bold" onClick={()=>handleAdminAction(exportToCSV)}>
            EXPORT
          </button>
        </div>
      </footer>

      {/* Sharing App Modal */}
      {showAppSelector && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded-4 p-4 w-75 text-center animate__animated animate__zoomIn" style={{maxWidth: '350px'}}>
            <h5 className="fw-black mb-3">SHARE ORDER</h5>
            <div className="d-grid gap-2">
              <button className="btn btn-success fw-bold" onClick={()=>handleShare('wa')}>WHATSAPP</button>
              <button className="btn btn-primary fw-bold" onClick={()=>handleShare('tg')}>TELEGRAM</button>
              <button className="btn btn-dark fw-bold" onClick={()=>handleShare('email')}>EMAIL</button>
            </div>
            <button className="btn btn-link text-muted mt-3" onClick={()=>setShowAppSelector(false)}>CLOSE</button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-85 d-flex align-items-center justify-content-center z-3 p-3">
          <div className="bg-white rounded-3 w-100 h-100 d-flex flex-column overflow-hidden shadow-lg animate__animated animate__fadeInUp">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-primary text-white">
              <h6 className="mb-0 fw-bold">RECORDS (MAX 10,000)</h6>
              <button className="btn-close btn-close-white" onClick={()=>setShowHistory(false)}></button>
            </div>
            <div className="flex-grow-1 overflow-auto">
              <table className="table table-hover table-sm small align-middle mb-0">
                <thead className="table-light sticky-top">
                  <tr><th>ID</th><th>DATE</th><th>TYPE</th><th>TOTAL</th><th>PRINTER</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td className="fw-bold">#{h.id.toString().slice(-4)}</td>
                      <td>{h.date}</td>
                      <td><span className={`badge ${h.type === 'Dine-in' ? 'bg-primary' : 'bg-warning text-dark'}`} style={{fontSize: '0.65rem'}}>{h.type}</span></td>
                      <td className="fw-black">£{h.total.toFixed(2)}</td>
                      <td><button className="btn btn-sm btn-link text-dark p-0"><i className="bi bi-printer-fill"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="text-center py-5 text-muted">No records yet.</p>}
            </div>
            <div className="p-2 border-top">
              <button className="btn btn-success btn-sm w-100 fw-bold" onClick={exportToCSV}>EXPORT DATA TO CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

// Pos.jsx - Sales (POS) ng Gulayan at Prutasan staff
// Pumili ng product -> Cart -> Complete Sale. Bawat linya ng cart ay nase-save bilang sale
// (POST /sales) at awtomatikong nababawasan ang inventory.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, peso } from '../services/api.js';
import ProductImage from './ProductImage.jsx';
import '../styles/pos.css';

// Mga category chip (batay sa pangalan ng product)
const GROUPS = {
  gulayan: { Leafy: ['kangkong', 'pechay', 'repolyo'], 'Root Crops': ['sibuyas'], Legumes: ['sitaw', 'okra'] },
  prutasan: { Mango: ['mango'], Saging: ['saging'], Bayabas: ['bayabas'], Pakwan: ['pakwan'] },
};


export default function Pos() {
  const { dept } = useParams();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('All');
  const [view, setView] = useState('grid');
  const [cart, setCart] = useState({}); // { itemId: kilos }

  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); // phone: bottom sheet ng cart

  const load = () => api.get(`/inventory/${dept}`).then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => { load(); setCart({}); setChip('All'); setCartOpen(false); }, [dept]);

  const groups = GROUPS[dept] || {};
  const chips = ['All', ...Object.keys(groups), 'Others'];
  const inChip = (name) => {
    if (chip === 'All') return true;
    const n = name.toLowerCase();
    if (chip === 'Others') return !Object.values(groups).some((list) => list.includes(n));
    return (groups[chip] || []).includes(n);
  };
  const shown = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) && inChip(i.name));

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const lines = Object.entries(cart).map(([id, kilos]) => ({ item: byId[id], kilos })).filter((l) => l.item);
  const total = lines.reduce((a, l) => a + l.kilos * Number(l.item.sell_price), 0);

  // isasara ang sheet kapag naubos ang cart; hindi gagalaw ang likod na page habang bukas ang sheet
  useEffect(() => { if (!lines.length) setCartOpen(false); }, [lines.length]);
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const change = (item, delta) => {
    setCart((c) => {
      const next = Math.round(((c[item.id] || 0) + delta) * 100) / 100;
      const copy = { ...c };
      if (next <= 0) delete copy[item.id];
      else if (next > Number(item.quantity)) { setMsg(`Only ${item.quantity} kg of ${item.name} left.`); }
      else copy[item.id] = next;
      return copy;
    });
  };

  const complete = async () => {
    if (!lines.length) return;
    setBusy(true);
    const failed = [];
    let completedTotal = 0;
    const completedIds = [];
    for (const l of lines) {
      try {
        await api.post('/sales', { department: dept, item_id: l.item.id, kilos: l.kilos, price_per_kilo: Number(l.item.sell_price) });
        completedTotal += l.kilos * Number(l.item.sell_price);
        completedIds.push(l.item.id);
      } catch (e) { failed.push(`${l.item.name}: ${e.message}`); }
    }
    setBusy(false);
    setCart((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !completedIds.includes(Number(id)))));
    if (!failed.length) setCartOpen(false);
    setMsg(failed.length ? `Saved ${peso(completedTotal)}. Failed items remain in cart: ${failed.join(' | ')}` : `Sale completed. Total ${peso(completedTotal)}`);
    load();
  };

  return (
    <>
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}
      <div className="pos-head">
        <h1>{dept} Sales (POS)</h1>
        <p>Point of Sale • {dept === 'gulayan' ? 'Vegetables' : 'Fruits'} Department</p>
      </div>

      <div className="pos-layout">
        <section className="card pos-products">
          <div className="pos-tools">
            <input className="pos-search" placeholder={dept === 'gulayan' ? 'Search vegetable...' : 'Search fruit...'} value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="view-toggle">
              <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view">▦</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view">☰</button>
            </div>
          </div>
          <div className="chip-row">
            {chips.map((c) => <button key={c} className={`pos-chip ${chip === c ? 'active' : ''}`} onClick={() => setChip(c)}>{c}</button>)}
          </div>

          <div className={view === 'grid' ? 'product-grid' : 'product-list'}>
            {shown.map((i) => {
              const out = Number(i.quantity) <= 0 || Number(i.sell_price) <= 0;
              const inCart = cart[i.id] || 0;
              return (
                <div className={`product-card ${inCart ? 'in-cart' : ''}`} key={i.id}>
                  <ProductImage name={i.name} size={view === 'grid' ? 72 : 48} />
                  <div className="product-info">
                    <strong>{i.name}</strong>
                    <span className="product-price">{Number(i.sell_price) > 0 ? `${peso(i.sell_price)} / kg` : 'No price yet'}</span>
                    <small>Stock: {Number(i.quantity).toFixed(2)} kg</small>
                  </div>
                  {inCart > 0 ? (
                    <div className="card-qty">
                      <button onClick={() => change(i, -1)} aria-label={`Less ${i.name}`}>−</button>
                      <span>{inCart.toFixed(2)} kg</span>
                      <button onClick={() => change(i, 1)} aria-label={`More ${i.name}`}>+</button>
                    </div>
                  ) : (
                    <button className="btn-primary pos-add" disabled={out} onClick={() => change(i, 1)}>{out ? 'Unavailable' : '+ Add'}</button>
                  )}
                </div>
              );
            })}
            {!shown.length && <div className="empty-state">No products found.</div>}
          </div>
        </section>

        <aside className={`card pos-cart ${cartOpen ? 'open' : ''}`} aria-label="Cart">
          <div className="cart-grab" aria-hidden="true" />
          <div className="cart-head">
            <h3>Cart ({lines.length})</h3>
            <div className="cart-head-actions">
              <button className="btn-ghost small-btn" onClick={() => setCart({})} disabled={!lines.length}>Clear</button>
              <button className="btn-ghost small-btn cart-close" onClick={() => setCartOpen(false)}>Close</button>
            </div>
          </div>
          <div className="cart-lines">
            {lines.map(({ item, kilos }) => (
              <div className="cart-line" key={item.id}>
                <span className="cart-img"><ProductImage key={item.name} name={item.name} size={44} /></span>
                <div className="cart-name"><strong>{item.name}</strong><small>{peso(item.sell_price)} / kg</small></div>
                <b className="cart-amt">{peso(kilos * Number(item.sell_price))}</b>
                <div className="qty">
                  <button onClick={() => change(item, -1)} aria-label="Less">−</button>
                  <span>{kilos.toFixed(2)} kg</span>
                  <button onClick={() => change(item, 1)} aria-label="More">+</button>
                </div>
              </div>
            ))}
            {!lines.length && <div className="empty-state">Cart is empty.</div>}
          </div>
          <div className="cart-foot">
            <div className="cart-total"><span>Total</span><strong>{peso(total)}</strong></div>
            <div className="pay-label">Payment: Cash only</div>
            <button className="btn-primary complete-btn" disabled={!lines.length || busy} onClick={complete}>{busy ? 'Saving...' : 'Complete Sale'}</button>
          </div>
        </aside>
      </div>

      {/* Phone lang: floating cart bar (laging abot ng hinlalaki) at scrim ng bottom sheet */}
      {cartOpen && <div className="cart-scrim" onClick={() => setCartOpen(false)} />}
      {lines.length > 0 && !cartOpen && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span className="cart-bar-count">{lines.length}</span>
          <span className="cart-bar-label">View cart</span>
          <strong>{peso(total)}</strong>
        </button>
      )}
    </>
  );
}

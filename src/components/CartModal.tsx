import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Ticket, Copy, Check, Truck, Store, MapPin } from 'lucide-react';
import { Order } from '../types';

export const CartModal: React.FC = () => {
  const { activeModal, setActiveModal, cart, updateCartQuantity, removeFromCart, submitOrder, tenantSettings, t } = useApp();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (activeModal !== 'cart') return null;

  const enableDelivery = tenantSettings.enableDelivery ?? true;
  const deliveryFee = tenantSettings.deliveryFee ?? 1200;

  const itemsTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const finalTotal = itemsTotal + (deliveryType === 'delivery' ? deliveryFee : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) return;

    const order = submitOrder(
      customerName,
      customerPhone,
      deliveryType,
      deliveryType === 'delivery' ? deliveryAddress : '',
      deliveryType === 'delivery' ? deliveryFee : 0
    );

    if (order) {
      setConfirmedOrder(order);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDeliveryType('pickup');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold font-jakarta">{t.cartTitle}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {confirmedOrder ? (
            /* Order Success & Pickup Code Card */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-white font-playfair">{t.orderSuccessTitle}</h4>
              <p className="text-stone-300 text-sm max-w-xs mx-auto">
                {confirmedOrder.deliveryType === 'delivery'
                  ? 'Tu pedido fue registrado con Envío a Domicilio.'
                  : t.pickupCodeSub}
              </p>

              {/* Receipt Ticket Box */}
              <div className="bg-stone-950 border border-amber-500/40 p-5 rounded-xl space-y-3 relative overflow-hidden text-left">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-xs uppercase tracking-wider font-semibold">
                  <Ticket className="w-4 h-4" />
                  {confirmedOrder.deliveryType === 'delivery' ? 'Código de Confirmación de Pedido' : t.pickupCodeNotice}
                </div>
                <div className="text-3xl font-black font-space text-amber-400 tracking-wider text-center">
                  {confirmedOrder.pickupCode}
                </div>

                <div className="pt-3 text-xs text-stone-300 border-t border-stone-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <strong className="text-stone-100">{confirmedOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Teléfono:</span>
                    <span className="text-stone-300">{confirmedOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidad:</span>
                    <strong className="text-amber-400 capitalize">
                      {confirmedOrder.deliveryType === 'delivery' ? '🚚 Envío a Domicilio' : '🏬 Retiro en Local'}
                    </strong>
                  </div>
                  {confirmedOrder.deliveryType === 'delivery' && confirmedOrder.deliveryAddress && (
                    <div className="flex justify-between">
                      <span>Dirección:</span>
                      <span className="text-stone-200">{confirmedOrder.deliveryAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-stone-850">
                    <span>Monto Total:</span>
                    <strong className="text-amber-400 text-sm">${confirmedOrder.totalPrice.toLocaleString()}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCode(confirmedOrder.pickupCode)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold rounded-lg border border-stone-700 transition-colors mt-2"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? '¡Código Copiado!' : 'Copiar Código de Pedido'}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-md"
              >
                {t.close}
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-400 text-sm">{t.cartEmpty}</p>
            </div>
          ) : (
            /* Cart Items & Form */
            <>
              <div className="space-y-3 divide-y divide-stone-800">
                {cart.map(item => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg border border-stone-800 shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-stone-100">{item.product.name}</h4>
                        <p className="text-xs text-stone-400">{item.product.unit} | ${item.product.price.toLocaleString()}</p>
                        <p className="text-xs font-bold text-amber-400 mt-0.5">${(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-stone-800 border border-stone-700 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="p-1.5 text-stone-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-stone-100">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="p-1.5 text-stone-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Option Selector (If enabled by tenant) */}
              {enableDelivery && (
                <div className="border-t border-stone-800 pt-4 space-y-2">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Opción de Entrega / Retiro
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        deliveryType === 'pickup'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retiro en Local</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        deliveryType === 'delivery'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Envío (${deliveryFee})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="border-t border-stone-800 pt-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Subtotal productos:</span>
                  <span>${itemsTotal.toLocaleString()}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Costo de envío:</span>
                    <span>+${deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-bold pt-1">
                  <span className="text-stone-300">{t.total}:</span>
                  <span className="text-amber-400 text-xl font-space">${finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Checkout Form */}
              <form onSubmit={handleSubmit} className="border-t border-stone-800 pt-4 space-y-3">
                <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">{t.checkoutTitle}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">{t.yourName} *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura González"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">{t.yourPhone} *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 11 4920 8392"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-medium text-amber-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Dirección Completa para Envío *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Av. Santa Fe 2480 3A, CABA"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!customerName.trim() || !customerPhone.trim() || (deliveryType === 'delivery' && !deliveryAddress.trim())}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl transition-all shadow-md mt-2"
                >
                  {t.confirmOrder}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

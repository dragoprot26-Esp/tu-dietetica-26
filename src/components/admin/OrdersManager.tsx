import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  Phone,
  Search,
  Trash2,
  UserCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    session,
    tenantSettings
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'entregado' | 'cancelado'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Visible orders based on user role (collaborator sees assigned or all orders)
  const roleFilteredOrders = session.role === 'colaborador'
    ? orders.filter(o => !o.collaboratorId || o.collaboratorId === session.userId)
    : orders;

  // Filtered orders based on search & status
  const filteredOrders = roleFilteredOrders.filter(order => {
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      order.pickupCode.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q) ||
      (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(q));
    
    return matchesStatus && matchesQuery;
  });

  const pendingCount = roleFilteredOrders.filter(o => o.status === 'pendiente').length;
  const deliveredCount = roleFilteredOrders.filter(o => o.status === 'entregado').length;
  const cancelledCount = roleFilteredOrders.filter(o => o.status === 'cancelado').length;

  const handleStatusChange = (orderId: string, newStatus: 'pendiente' | 'entregado' | 'cancelado') => {
    const fulfilledBy = session.role === 'inquilino'
      ? 'Inquilino Administrador'
      : (session.userName || 'Colaborador');
    
    updateOrderStatus(orderId, newStatus, fulfilledBy);
  };

  const formatPhoneForWa = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('549')) return digits;
    if (digits.startsWith('11') || digits.startsWith('15')) {
      return `549${digits.replace(/^15/, '')}`;
    }
    return `549${digits}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-stone-900 to-stone-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-playfair text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            Gestión de Pedidos & Códigos de Retiro
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Revisá los encargos en tiempo real, controlá quién realizó la entrega y administrá su estado.
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'todos'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 bg-stone-950/30 rounded-full text-[10px] font-extrabold">
              {roleFilteredOrders.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pendiente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'pendiente'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendientes</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 rounded-full text-[10px] font-extrabold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('entregado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'entregado'
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Entregados</span>
            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full text-[10px] font-extrabold border border-emerald-700">
              {deliveredCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('cancelado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'cancelado'
                ? 'bg-rose-500 text-white border-rose-400 shadow'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelados</span>
            <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 rounded-full text-[10px] font-extrabold border border-rose-700">
              {cancelledCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 p-3.5 rounded-2xl border border-stone-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código #TD-, nombre o teléfono..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          <span>Mostrando <strong className="text-amber-400">{filteredOrders.length}</strong> pedidos</span>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-stone-300">No se encontraron pedidos</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'todos'
              ? 'Pruebe cambiando los filtros de búsqueda o seleccionando otra pestaña.'
              : 'Cuando los clientes realicen encargos desde la tienda pública, aparecerán listados aquí.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'entregado';
            const isCancelled = order.status === 'cancelado';
            const isPending = order.status === 'pendiente';
            const isDelivery = order.deliveryType === 'delivery';

            return (
              <div
                key={order.id}
                className={`bg-stone-900 rounded-2xl border transition-all overflow-hidden shadow-lg ${
                  isPending
                    ? 'border-amber-500/50 shadow-amber-950/20'
                    : isDelivered
                    ? 'border-emerald-800/60'
                    : 'border-stone-800 opacity-80'
                }`}
              >
                {/* Order Top Header */}
                <div className="bg-stone-950 p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {order.pickupCode}
                    </span>

                    {/* Delivery Mode Pill */}
                    {isDelivery ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-400" />
                        Envío a Domicilio
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                        <Store className="w-3 h-3 text-purple-400" />
                        Retiro en Local
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Pendiente de Entrega
                      </span>
                    )}

                    {isDelivered && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Entregado / Concretado
                      </span>
                    )}

                    {isCancelled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Cancelado
                      </span>
                    )}

                    <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      {new Date(order.date).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Main Order Content */}
                <div className="p-4 space-y-4">
                  
                  {/* Customer Info & Concreted By */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950/70 p-3.5 rounded-xl border border-stone-850">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                        Cliente
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-100">{order.customerName}</span>
                        <a
                          href={`https://wa.me/${formatPhoneForWa(order.customerPhone)}?text=${encodeURIComponent(`Hola ${order.customerName}, te escribimos de ${tenantSettings.name} con respecto a tu pedido ${order.pickupCode}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      </div>
                      <p className="text-xs font-mono text-stone-400 mt-0.5">{order.customerPhone}</p>

                      {isDelivery && order.deliveryAddress && (
                        <div className="mt-2 text-xs text-stone-300 bg-stone-900 p-2 rounded-lg border border-stone-800">
                          <strong className="text-amber-400">Dirección de Envío:</strong> {order.deliveryAddress}
                        </div>
                      )}
                    </div>

                    {/* Detalle de quién concretó la entrega */}
                    <div className="border-t md:border-t-0 md:border-l border-stone-800 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                          Responsable / Concreción de Entrega
                        </span>
                        
                        {isDelivered ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800 p-2.5 rounded-xl">
                            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <span className="block text-[11px] text-stone-400">Concretado por:</span>
                              <span className="font-bold text-white text-xs">
                                {order.collaboratorName || 'Inquilino Administrador'}
                              </span>
                            </div>
                          </div>
                        ) : isCancelled ? (
                          <div className="text-xs text-rose-400 font-semibold bg-rose-950/40 border border-rose-900 p-2 rounded-lg">
                            Pedido cancelado. No se registró entrega.
                          </div>
                        ) : (
                          <div className="text-xs text-stone-400 font-normal bg-stone-900 border border-stone-850 p-2 rounded-lg">
                            Pedido pendiente. Al marcar como <strong className="text-amber-400">"Entregado"</strong> se registrará automáticamente tu usuario ({session.role === 'inquilino' ? 'Inquilino Admin' : session.userName}).
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                      Detalle de Productos ({order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades)
                    </span>

                    <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden divide-y divide-stone-850">
                      {order.items.map((item, idx) => {
                        const subtotal = item.product.price * item.quantity;
                        return (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded-lg border border-stone-800 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-stone-100 block text-xs">{item.product.name}</span>
                                <span className="text-[11px] text-stone-400 font-mono">
                                  ${item.product.price.toLocaleString('es-AR')} x {item.quantity} {item.product.unit || 'un.'}
                                </span>
                              </div>
                            </div>

                            <span className="font-bold font-mono text-amber-400 text-xs">
                              ${subtotal.toLocaleString('es-AR')}
                            </span>
                          </div>
                        );
                      })}

                      {/* Delivery Fee row if applicable */}
                      {isDelivery && (order.deliveryFee ?? 0) > 0 && (
                        <div className="p-2.5 bg-stone-900/50 flex items-center justify-between text-xs text-stone-300 font-semibold">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <Truck className="w-3.5 h-3.5" />
                            Costo de Envío a Domicilio
                          </span>
                          <span className="font-mono text-stone-200">
                            +${(order.deliveryFee || 0).toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Footer Actions & Total */}
                  <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-semibold">Total Encargo:</span>
                      <span className="text-lg font-extrabold font-mono text-amber-400">
                        ${order.totalPrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Status Toggle Actions */}
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                      {!isDelivered && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'entregado')}
                          className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>Marcar Entregado</span>
                        </button>
                      )}

                      {!isPending && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'pendiente')}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-400 font-bold text-xs rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Revertir a Pendiente</span>
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelado')}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-stone-950 hover:bg-rose-950/80 text-rose-400 font-bold text-xs rounded-xl border border-rose-900/60 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el pedido ${order.pickupCode}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition-colors"
                        title="Eliminar pedido definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

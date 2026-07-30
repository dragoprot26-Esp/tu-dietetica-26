import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { Download, Trash2, Calendar, DollarSign, PackageCheck, UserCheck, ShieldAlert, CheckCircle } from 'lucide-react';

export const DashboardManager: React.FC = () => {
  const {
    orders,
    session,
    canClearSales,
    exportSalesSpreadsheet,
    clearSales
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'diario' | 'mensual' | 'anual'>('mensual');
  const [clearedNotice, setClearedNotice] = useState(false);

  const isCollaborator = session.role === 'colaborador';

  // Filter orders by role scope:
  // Inquilino: sees all sales from everyone
  // Collaborator: sees ONLY sales delivered/created by them
  const visibleOrders = isCollaborator
    ? orders.filter(o => o.collaboratorId === session.userId)
    : orders;

  // Time filter filter logic
  const now = new Date();
  const filteredOrders = visibleOrders.filter(ord => {
    const ordDate = new Date(ord.date);
    if (timeFilter === 'diario') {
      return (
        ordDate.getDate() === now.getDate() &&
        ordDate.getMonth() === now.getMonth() &&
        ordDate.getFullYear() === now.getFullYear()
      );
    } else if (timeFilter === 'mensual') {
      return (
        ordDate.getMonth() === now.getMonth() &&
        ordDate.getFullYear() === now.getFullYear()
      );
    } else if (timeFilter === 'anual') {
      return ordDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalItemsCount = filteredOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const handleClearSalesAction = () => {
    if (confirm('¿Está seguro de vaciar el listado de ventas realizadas? Esta acción liberará el historial.')) {
      clearSales();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Role Banner & Scope Notice */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Vista: {isCollaborator ? 'Colaborador (Entregas Propias)' : 'Inquilino Admin (Todas las Ventas)'}
          </span>
          <h3 className="text-xl font-bold font-playfair text-white mt-1">Dashboard & Reporte de Ventas</h3>
        </div>

        {/* Time Period Filter: Diario, Mensual, Anual */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setTimeFilter('diario')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'diario' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            Diario
          </button>
          <button
            onClick={() => setTimeFilter('mensual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'mensual' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setTimeFilter('anual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'anual' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Monto Total Facturado</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-space text-amber-400">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-500">Período: {timeFilter}</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Encargos Realizados</span>
            <PackageCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-space text-white">
            {filteredOrders.length}
          </div>
          <p className="text-[11px] text-stone-500">Total ítems vendidos: {totalItemsCount}</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Atención / Operador</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-stone-200">
            {session.userName}
          </div>
          <p className="text-[11px] text-stone-500">Permisos: {session.role}</p>
        </div>
      </div>

      {/* Export Spreadsheet & Clear List Bar */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-stone-100">Exportación & Vaciamiento de Historial</h4>
          <p className="text-xs text-stone-400">
            {canClearSales
              ? '✅ Planilla descargada. Ahora podés vaciar el listado de ventas.'
              : 'Descargá la planilla de cálculo en Excel para habilitar el botón de vaciar listado.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Download Spreadsheet Button */}
          <button
            onClick={exportSalesSpreadsheet}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Bajar Planilla de Cálculo (Excel)</span>
          </button>

          {/* Vaciar Listado de Ventas Button (Enabled only after downloading!) */}
          <button
            disabled={!canClearSales || filteredOrders.length === 0}
            onClick={handleClearSalesAction}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              canClearSales && filteredOrders.length > 0
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer'
                : 'bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed opacity-60'
            }`}
            title={canClearSales ? 'Vaciar el listado de ventas acumuladas' : 'Primero debe descargar la planilla'}
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Listado de Ventas</span>
          </button>
        </div>
      </div>

      {clearedNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Historial de ventas vaciado con éxito.</span>
        </div>
      )}

      {/* Sales History Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 font-bold text-sm text-stone-200">
          Listado de Ventas ({filteredOrders.length})
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No hay ventas registradas en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                <tr>
                  <th className="p-3">Código Retiro</th>
                  <th className="p-3">Cliente & Teléfono</th>
                  <th className="p-3">Detalle Productos</th>
                  <th className="p-3">Total ($)</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-stone-850/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{ord.pickupCode}</td>
                    <td className="p-3">
                      <div className="font-semibold text-stone-100">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-400">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 max-w-xs">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="line-clamp-1">
                          • {item.quantity}x {item.product.name}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-bold text-emerald-400 font-space">${ord.totalPrice.toLocaleString()}</td>
                    <td className="p-3 text-[11px] text-stone-400">{new Date(ord.date).toLocaleString('es-AR')}</td>
                    <td className="p-3 text-[11px] text-stone-300">{ord.collaboratorName || 'Inquilino Admin'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Sale, Customer, App } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, Trash2, AlertCircle, Edit, Send, Eye } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { Toast } from '../ui/Toast';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { resendOrderCodes } from '../../lib/whatsapp';
import { useToast } from '../../hooks/useToast';

interface SalesListProps {
  sales: Sale[];
  customers: Customer[];
  apps: App[];
  onConfirm: (saleId: string) => void;
  onCancel: (saleId: string) => void;
  onDelete: (saleId: string) => void;
  onEdit: (saleId: string) => void;
}

export function SalesList({ 
  sales, 
  customers, 
  apps, 
  onConfirm,
  onCancel,
  onDelete,
  onEdit
}: SalesListProps) {
  const [resending, setResending] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const sortedSales = [...sales].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusText = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const handleResendCodes = async (sale: Sale) => {
    if (resending) return;
    setResending(sale.id);

    try {
      const customer = customers.find(c => c.id === sale.customerId);
      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      await resendOrderCodes(sale, customer, apps);
      showToast('Códigos reenviados com sucesso!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao reenviar códigos';
      showToast(errorMessage, 'error');
    } finally {
      setResending(null);
    }
  };

  if (!sales.length) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID da Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSales.map((sale) => {
                  const customer = customers.find(c => c.id === sale.customerId);
                  const totalPrice = typeof sale.totalPrice === 'number' ? sale.totalPrice : 0;
                  const saleId = sale.id.slice(-6).toUpperCase();
                  
                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{saleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(sale.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer?.name || 'Cliente não encontrado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                            {getStatusText(sale.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Tooltip content="Ver Detalhes">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedSale(selectedSale === sale.id ? null : sale.id)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            {sale.status === 'pending' && (
                              <>
                                <Tooltip content="Confirmar">
                                  <Button
                                    variant="outline"
                                    onClick={() => onConfirm(sale.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Cancelar">
                                  <Button
                                    variant="outline"
                                    onClick={() => onCancel(sale.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Editar">
                                  <Button
                                    variant="outline"
                                    onClick={() => onEdit(sale.id)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                            {sale.status === 'confirmed' && sale.items?.some(item => item.codes?.length > 0) && (
                              <Tooltip content="Reenviar Códigos">
                                <Button
                                  variant="outline"
                                  onClick={() => handleResendCodes(sale)}
                                  disabled={resending === sale.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Send className={`w-4 h-4 ${resending === sale.id ? 'animate-spin' : ''}`} />
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip content="Excluir">
                              <Button
                                variant="outline"
                                onClick={() => onDelete(sale.id)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                      {selectedSale === sale.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Itens do Pedido</h4>
                                {sale.items?.map((item, index) => {
                                  const app = apps.find(a => a.id === item.appId);
                                  const itemTotal = (item.price || 0) * (item.quantity || 0);
                                  return (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{app?.name || 'Aplicativo não encontrado'} x{item.quantity || 0}</span>
                                      <span>{formatCurrency(itemTotal)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {sale.status === 'confirmed' && sale.items?.some(item => item.codes?.length > 0) && (
                                <div className="space-y-2">
                                  <h4 className="font-medium text-gray-900">Códigos</h4>
                                  {sale.items.map((item, index) => {
                                    const app = apps.find(a => a.id === item.appId);
                                    if (!item.codes?.length) return null;
                                    return (
                                      <div key={index} className="text-sm">
                                        <p className="font-medium text-gray-700">{app?.name}:</p>
                                        <div className="mt-1 space-y-1">
                                          {item.codes.map((code, codeIndex) => (
                                            <p key={codeIndex} className="font-mono text-gray-600">{code}</p>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}
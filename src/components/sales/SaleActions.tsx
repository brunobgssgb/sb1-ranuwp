import React from 'react';
import { Sale } from '../../types';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Check, X, Edit, Send, Eye, Trash2 } from 'lucide-react';

interface SaleActionsProps {
  sale: Sale;
  onView: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResend?: () => void;
  isResending?: boolean;
  showCodes?: boolean;
}

export function SaleActions({
  sale,
  onView,
  onConfirm,
  onCancel,
  onEdit,
  onDelete,
  onResend,
  isResending,
  showCodes
}: SaleActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Tooltip content="Ver Detalhes">
        <Button
          variant="outline"
          onClick={onView}
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
              onClick={onConfirm}
              className="text-green-600 hover:text-green-700"
            >
              <Check className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Cancelar">
            <Button
              variant="outline"
              onClick={onCancel}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Editar">
            <Button
              variant="outline"
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Tooltip>
        </>
      )}
      
      {showCodes && onResend && (
        <Tooltip content="Reenviar Códigos">
          <Button
            variant="outline"
            onClick={onResend}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700"
          >
            <Send className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
          </Button>
        </Tooltip>
      )}
      
      <Tooltip content="Excluir">
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-gray-600 hover:text-gray-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
import React from 'react';
import { Copy, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';

interface PaymentModalProps {
  pixCode: string;
  onClose: () => void;
}

export function PaymentModal({ pixCode, onClose }: PaymentModalProps) {
  const { toast, showToast, hideToast } = useToast();

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      showToast('Código PIX copiado!', 'success');
    } catch (error) {
      showToast('Erro ao copiar código', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pagamento PIX</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-mono break-all select-all">
              {pixCode}
            </p>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleCopyPixCode}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Código PIX
            </Button>
          </div>

          <div className="text-center space-y-2 text-sm text-gray-500">
            <p>1. Copie o código PIX acima</p>
            <p>2. Abra o aplicativo do seu banco</p>
            <p>3. Escolha a opção PIX Copia e Cola</p>
            <p>4. Cole o código e confirme o pagamento</p>
            <p className="text-blue-600 font-medium">
              Após a confirmação do pagamento, os códigos serão enviados automaticamente
            </p>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </div>
  );
}
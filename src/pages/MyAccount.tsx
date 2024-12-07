import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { AlertCircle, Save, LogOut, Key, MessageSquare, CreditCard } from 'lucide-react';
import { updateWhatsAppConfig } from '../services/whatsapp.service';
import { updateMercadoPagoConfig } from '../services/mercadopago.service';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export function MyAccount() {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    whatsappSecret: currentUser?.whatsappSecret || '',
    whatsappAccount: currentUser?.whatsappAccount || '',
    mercadopagoToken: currentUser?.mercadopagoToken || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const webhookUrl = currentUser?.id 
    ? `${window.location.origin}/api/webhook/mercadopago/${currentUser.id}`
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);

    try {
      await updateProfile({
        ...formData,
        id: currentUser.id,
        isAdmin: currentUser.isAdmin
      });

      if (formData.whatsappSecret && formData.whatsappAccount) {
        await updateWhatsAppConfig(
          currentUser.id,
          formData.whatsappSecret,
          formData.whatsappAccount
        );
      }

      if (formData.mercadopagoToken) {
        await updateMercadoPagoConfig(
          currentUser.id,
          formData.mercadopagoToken
        );
      }

      showToast('Informações atualizadas com sucesso!', 'success');
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar informações';
      showToast(errorMessage, 'error');
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Erro ao fazer logout', 'error');
    }
  };

  if (!currentUser) return null;

  return (
    <PageContainer 
      title="Minha Conta"
      description="Gerencie suas informações pessoais"
    >
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Informações Pessoais
            </h2>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <FormField label="Nome">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing || isLoading}
              />
            </FormField>

            <FormField label="Email">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing || isLoading}
                className="lowercase"
              />
            </FormField>

            <FormField label="Telefone">
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing || isLoading}
              />
            </FormField>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Configuração do WhatsApp
              </h3>

              <FormField label="Secret Key">
                <Input
                  type="password"
                  value={formData.whatsappSecret}
                  onChange={(e) => setFormData({ ...formData, whatsappSecret: e.target.value })}
                  disabled={!isEditing || isLoading}
                  placeholder={isEditing ? "Digite sua chave secreta do WhatsApp" : "••••••••"}
                />
              </FormField>

              <FormField label="Account ID">
                <Input
                  value={formData.whatsappAccount}
                  onChange={(e) => setFormData({ ...formData, whatsappAccount: e.target.value })}
                  disabled={!isEditing || isLoading}
                  placeholder={isEditing ? "Digite seu ID de conta do WhatsApp" : "••••••••"}
                />
              </FormField>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Configuração do Mercado Pago
              </h3>

              <FormField label="Access Token">
                <Input
                  type="password"
                  value={formData.mercadopagoToken}
                  onChange={(e) => setFormData({ ...formData, mercadopagoToken: e.target.value })}
                  disabled={!isEditing || isLoading}
                  placeholder={isEditing ? "Digite seu Access Token do Mercado Pago" : "••••••••"}
                />
              </FormField>

              <FormField label="Webhook URL">
                <div className="relative">
                  <Input
                    value={webhookUrl}
                    readOnly
                    disabled
                    className="pr-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="absolute right-1 top-1 h-8"
                    onClick={async () => {
                      await navigator.clipboard.writeText(webhookUrl);
                      showToast('URL copiada!', 'success');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Configure esta URL no painel do Mercado Pago para receber notificações de pagamento
                </p>
              </FormField>
            </div>

            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: currentUser.name,
                        email: currentUser.email,
                        phone: currentUser.phone,
                        whatsappSecret: currentUser.whatsappSecret || '',
                        whatsappAccount: currentUser.whatsappAccount || '',
                        mercadopagoToken: currentUser.mercadopagoToken || ''
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Editar Informações
                </Button>
              )}
            </div>
          </form>
        </Card.Content>
      </Card>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </PageContainer>
  );
}
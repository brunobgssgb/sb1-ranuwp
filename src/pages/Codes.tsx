import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, Code as CodeIcon } from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { FormField } from '../components/ui/FormField';

export function Codes() {
  const { apps, codes, addCodes } = useStore();
  const [selectedAppId, setSelectedAppId] = useState('');
  const [codesInput, setCodesInput] = useState('');
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [systemDuplicates, setSystemDuplicates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const appCodes = codes.filter((code) => code.appId === selectedAppId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDuplicates([]);
    setSystemDuplicates([]);
    setIsSubmitting(true);
    setProgress(0);

    try {
      const codesList = codesInput
        .split('\n')
        .map((code) => code.trim())
        .filter((code) => code)
        .map(code => code.replace(/\D/g, ''));

      const invalidCodes = codesList.filter((code) => code.length !== 16);
      
      if (invalidCodes.length > 0) {
        setError('Todos os códigos devem ter 16 dígitos');
        return;
      }

      const result = await addCodes(selectedAppId, codesList, setProgress);
      
      if (result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
      }

      if (result.systemDuplicates.length > 0) {
        setSystemDuplicates(result.systemDuplicates);
      }

      if (result.validCodes.length > 0) {
        setCodesInput('');
      }
    } catch (err) {
      setError('Erro ao cadastrar códigos. Por favor, tente novamente.');
      console.error('Error adding codes:', err);
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <PageContainer 
      title="Gerenciamento de Códigos"
      description="Cadastre e gerencie códigos de recarga"
    >
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">
            Cadastro de Códigos
          </h2>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <FormField label="Aplicativo" required>
              <select
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Selecione o Aplicativo</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.codesAvailable} códigos disponíveis)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Códigos" required>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-mono"
                placeholder="Digite os códigos (um por linha)"
                value={codesInput}
                onChange={(e) => setCodesInput(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {isSubmitting && progress > 0 && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Progresso
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {duplicates.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                <p className="font-medium mb-2">Códigos duplicados na lista:</p>
                <ul className="text-sm space-y-1 font-mono">
                  {duplicates.map((code, index) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
            )}

            {systemDuplicates.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-md">
                <p className="font-medium mb-2">Códigos já existentes no sistema:</p>
                <ul className="text-sm space-y-1 font-mono">
                  {systemDuplicates.map((code, index) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!selectedAppId || isSubmitting}
              >
                <CodeIcon className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Processando códigos...' : 'Adicionar Códigos'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {selectedAppId && (
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Códigos Cadastrados
            </h2>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appCodes.map((code) => (
                    <tr key={code.id}>
                      <td className="px-6 py-4 font-mono">{code.code}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            code.used
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {code.used ? 'Usado' : 'Disponível'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}
    </PageContainer>
  );
}
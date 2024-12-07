# Guia de Instalação no aaPanel

## 1. Requisitos Prévios
- aaPanel instalado
- Node.js 18+ instalado
- Git instalado
- Domínio configurado apontando para o servidor

## 2. Instalação do Node.js via aaPanel
1. Acesse o painel do aaPanel
2. Vá para "App Store"
3. Procure por "Node.js" e clique em "Install"
4. Selecione a versão mais recente LTS (18.x ou superior)
5. Aguarde a instalação concluir

## 3. Configuração do Site no aaPanel
1. Vá para "Website"
2. Clique em "Add Site"
3. Preencha os campos:
   - Domain: app.seudominio.com.br
   - Type: Static Website
   - PHP Version: Não é necessário
   - Document Root: /www/wwwroot/app.seudominio.com.br

## 4. Configuração do Nginx
1. No aaPanel, vá para o site criado
2. Clique em "Configure"
3. Selecione "Configure" no Nginx
4. Substitua todo o conteúdo por:

```nginx
server {
    listen 80;
    server_name app.seudominio.com.br;

    root /www/wwwroot/app.seudominio.com.br/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location /api {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /www/wwwlogs/app.seudominio.com.br.log;
    error_log /www/wwwlogs/app.seudominio.com.br.error.log;
}
```

## 5. Instalação da Aplicação
1. Acesse o terminal SSH do servidor
2. Navegue até o diretório do site:
```bash
cd /www/wwwroot/app.seudominio.com.br
```

3. Clone o repositório:
```bash
git clone https://seu-repositorio.git .
```

4. Instale as dependências:
```bash
npm install
```

5. Crie o arquivo .env:
```bash
nano .env
```

6. Adicione as variáveis de ambiente necessárias:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_KEY=sua_chave_do_supabase
```

7. Faça o build da aplicação:
```bash
npm run build
```

## 6. Configuração do PM2
1. Instale o PM2 globalmente:
```bash
npm install -g pm2
```

2. Inicie a aplicação:
```bash
pm2 start ecosystem.config.js
```

3. Configure o PM2 para iniciar com o sistema:
```bash
pm2 startup
pm2 save
```

## 7. SSL/HTTPS (Opcional)
1. No aaPanel, vá para o site
2. Clique em "SSL"
3. Escolha "Let's Encrypt"
4. Selecione o domínio
5. Clique em "Apply"

## 8. Verificação
1. Acesse https://app.seudominio.com.br
2. Verifique se a aplicação está funcionando corretamente
3. Teste o login e as funcionalidades principais

## Solução de Problemas

### Logs
- Logs do Nginx: `/www/wwwlogs/app.seudominio.com.br.log`
- Logs de erro: `/www/wwwlogs/app.seudominio.com.br.error.log`
- Logs do PM2: `pm2 logs`

### Comandos Úteis
- Reiniciar aplicação: `pm2 restart all`
- Ver status: `pm2 status`
- Recarregar Nginx: `nginx -s reload`

### Permissões
Se houver problemas de permissão:
```bash
chown -R www:www /www/wwwroot/app.seudominio.com.br
chmod -R 755 /www/wwwroot/app.seudominio.com.br
```

## Suporte
Em caso de problemas:
1. Verifique os logs
2. Confirme as configurações do Nginx
3. Verifique se o PM2 está rodando
4. Confirme as variáveis de ambiente
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para redirecionar baseado no domínio
 * Especificamente para cadastroprestador.impactopr.seg.br
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host');
  const originalUrl = req.originalUrl;

  // Se for o domínio de cadastro de prestadores externos
  if (host === 'cadastroprestador.impactopr.seg.br') {
    // Se estiver acessando a raiz, redirecionar para a página de cadastro
    if (originalUrl === '/' || originalUrl === '') {
      return res.redirect('/cadastro-prestador-externo');
    }
    
    // Se estiver tentando acessar outras rotas, redirecionar para a página de cadastro
    if (!originalUrl.includes('/cadastro-prestador')) {
      return res.redirect('/cadastro-prestador-externo');
    }
  }

  next();
};

/**
 * Middleware para servir página específica baseada no domínio
 */
export const domainSpecificHandler = (req: Request, res: Response) => {
  const host = req.get('host');

  if (host === 'cadastroprestador.impactopr.seg.br') {
    // Retornar a página de cadastro de prestadores externos
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Prestadores - Impacto PR</title>
        <meta name="description" content="Cadastre-se como prestador de serviços da Impacto PR">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
            margin: 1rem;
          }
          .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 1rem;
          }
          .description {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.3s;
          }
          .btn:hover {
            background: #5a6fd8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🏢 Impacto PR</div>
          <div class="description">
            <h2>Cadastro de Prestadores</h2>
            <p>Cadastre-se como prestador de serviços da Impacto PR e faça parte da nossa rede de profissionais.</p>
            <p>Oferecemos oportunidades de trabalho em diversas áreas relacionadas à segurança e monitoramento.</p>
          </div>
          <a href="/cadastro-prestador-externo" class="btn">Iniciar Cadastro</a>
        </div>
        <script>
          // Redirecionamento automático após 3 segundos
          setTimeout(() => {
            window.location.href = '/cadastro-prestador-externo';
          }, 3000);
        </script>
      </body>
      </html>
    `);
  } else {
    // Para outros domínios, retornar página padrão
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Impacto PR - Sistema de Gestão</title>
      </head>
      <body>
        <h1>Impacto PR - Sistema de Gestão</h1>
        <p>Acesso ao sistema principal.</p>
        <a href="/login">Fazer Login</a>
      </body>
      </html>
    `);
  }
};

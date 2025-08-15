import { Router } from 'express';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rota de teste para prestador
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 [PrestadorProtected] Rota de teste acessada');
    console.log('👤 [PrestadorProtected] Usuário autenticado:', req.user);

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    res.json({
      message: 'Rota de teste do prestador funcionando!',
      user: {
        id: req.user.id || req.user.sub,
        email: req.user.email,
        role: req.user.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [PrestadorProtected] Erro na rota de teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar prestadores (simplificada)
router.get('/prestadores', async (req, res) => {
  try {
    console.log('📋 [PrestadorProtected] Listando prestadores...');

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        cidade: true,
        estado: true,
        aprovado: true,
        criado_em: true
      },
      where: {
        aprovado: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`✅ [PrestadorProtected] ${prestadores.length} prestadores encontrados`);
    res.json(prestadores);

  } catch (error) {
    console.error('❌ [PrestadorProtected] Erro ao listar prestadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter dados do prestador atual
router.get('/perfil', async (req, res) => {
  try {
    console.log('👤 [PrestadorProtected] Obtendo perfil do prestador...');

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Para este exemplo, vamos assumir que o user.id é o prestador_id
    const prestadorId = parseInt(req.user.id || req.user.sub || '0');

    const prestador = await db.prestador.findUnique({
      where: { id: prestadorId },
      select: {
        id: true,
        nome: true,
        cpf: true,
        telefone: true,
        email: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        aprovado: true,
        valor_acionamento: true,
        franquia_horas: true,
        franquia_km: true,
        valor_hora_adc: true,
        valor_km_adc: true,
        criado_em: true,
        funcoes: {
          select: {
            funcao: true
          }
        },
        regioes: {
          select: {
            regiao: true
          }
        },
        veiculos: {
          select: {
            tipo: true
          }
        }
      }
    });

    if (!prestador) {
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    console.log(`✅ [PrestadorProtected] Perfil do prestador ${prestador.nome} obtido com sucesso`);
    res.json(prestador);

  } catch (error) {
    console.error('❌ [PrestadorProtected] Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

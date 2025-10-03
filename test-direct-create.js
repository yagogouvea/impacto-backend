const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDirectCreate() {
  try {
    console.log('🧪 Testando criação direta no banco...');
    
    // Testar criação direta no banco
    const user = await prisma.user.create({
      data: {
        name: 'Teste Direto',
        email: 'direto@teste.com',
        passwordHash: 'hash123',
        role: 'usuario',
        permissions: JSON.stringify(['read:dashboard']),
        active: true
      }
    });
    
    console.log('✅ Usuário criado diretamente:', user.id);
    
    // Limpar
    await prisma.user.delete({
      where: { id: user.id }
    });
    
    console.log('✅ Usuário removido');
    
  } catch (error) {
    console.error('❌ Erro na criação direta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectCreate();



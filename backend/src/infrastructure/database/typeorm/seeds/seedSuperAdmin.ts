import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { BcryptHashProvider } from '../../../providers/hash/BcryptHashProvider.js';
import crypto from 'node:crypto';

export async function seedSuperAdmin(): Promise<void> {
  const userRepository = AppDataSource.getRepository(User);
  const hashProvider = new BcryptHashProvider();

  const superAdminEmail = 'gabrielvictos152@gmail.com';
  const superAdminPass = '123456789';

  try {
    const existing = await userRepository.findOneBy({ email: superAdminEmail });

    if (!existing) {
      console.log('🌱 Semeando usuário Superroot no banco de dados PostgreSQL...');
      const passwordHash = await hashProvider.generateHash(superAdminPass);

      const superUser = new User({
        name: 'Super Admin Root',
        email: superAdminEmail,
        passwordHash,
        role: 'superadmin',
        storeId: null,
      });

      await userRepository.save(superUser);
      console.log(`✅ Superroot criado com sucesso! E-mail: ${superAdminEmail}`);
    } else {
      // Garante que o papel é estritamente superadmin
      let updated = false;
      if (existing.role !== 'superadmin') {
        existing.role = 'superadmin';
        updated = true;
      }
      // Verifica se a senha corresponde ao hash atual; se não, atualiza
      const passMatches = await hashProvider.compareHash(superAdminPass, existing.passwordHash);
      if (!passMatches) {
        existing.passwordHash = await hashProvider.generateHash(superAdminPass);
        updated = true;
      }
      if (updated) {
        await userRepository.save(existing);
        console.log(`🔄 Permissões/Credenciais do Superroot (${superAdminEmail}) sincronizadas no banco.`);
      } else {
        console.log(`ℹ️ Superroot (${superAdminEmail}) já cadastrado e ativo no PostgreSQL.`);
      }
    }
  } catch (err) {
    console.error('❌ Erro ao semear Superroot no banco de dados:', err);
  }
}

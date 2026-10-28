import { Request, Response, NextFunction } from 'express';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository.js';
import { IStoreRepository } from '../../../domain/repositories/IStoreRepository.js';
import { IHashProvider } from '../../../domain/providers/IHashProvider.js';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider.js';
import { Customer, CustomerPet } from '../../../infrastructure/database/typeorm/entities/Customer.js';

export class CustomerAuthController {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.storeRepository.findBySlug(slug);
      if (!store) {
        res.status(404).json({ message: 'Loja não encontrada.' });
        return;
      }

      const { name, email, password, phone, hasTransportBox, pets, petName, petBreed, petSpecies, petSpecialCare } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await this.customerRepository.findByEmailAndStore(cleanEmail, store.id);
      if (existing) {
        res.status(409).json({ message: 'Já existe um cadastro com este e-mail nesta loja. Faça login para continuar.' });
        return;
      }

      const passwordHash = await this.hashProvider.generateHash(password);

      // Monta lista de pets (suporta array ou pet único inicial)
      const customerPets: CustomerPet[] = [];
      if (Array.isArray(pets) && pets.length > 0) {
        pets.forEach((p: any) => {
          if (p.name && p.name.trim()) {
            customerPets.push({
              id: crypto.randomUUID(),
              name: p.name.trim(),
              breed: p.breed?.trim() || '',
              species: p.species || 'cao',
              specialCare: p.specialCare?.trim() || '',
              hasTransportBox: p.hasTransportBox ?? Boolean(hasTransportBox),
            });
          }
        });
      } else if (petName && petName.trim()) {
        customerPets.push({
          id: crypto.randomUUID(),
          name: petName.trim(),
          breed: petBreed?.trim() || '',
          species: petSpecies || 'cao',
          specialCare: petSpecialCare?.trim() || '',
          hasTransportBox: Boolean(hasTransportBox),
        });
      }

      const newCustomer = new Customer({
        storeId: store.id,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: (phone || '').trim(),
        hasTransportBox: Boolean(hasTransportBox),
        pets: customerPets,
      });

      const saved = await this.customerRepository.create(newCustomer);

      const token = this.tokenProvider.generateToken({
        userId: saved.id,
        storeId: store.id,
        role: 'customer' as any,
      });

      res.status(201).json({
        token,
        customer: {
          id: saved.id,
          name: saved.name,
          email: saved.email,
          phone: saved.phone,
          hasTransportBox: saved.hasTransportBox,
          pets: saved.pets,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.storeRepository.findBySlug(slug);
      if (!store) {
        res.status(404).json({ message: 'Loja não encontrada.' });
        return;
      }

      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        return;
      }

      const customer = await this.customerRepository.findByEmailAndStore(email.toLowerCase().trim(), store.id);
      if (!customer) {
        res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        return;
      }

      const passwordMatches = await this.hashProvider.compareHash(password, customer.passwordHash);
      if (!passwordMatches) {
        res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        return;
      }

      const token = this.tokenProvider.generateToken({
        userId: customer.id,
        storeId: store.id,
        role: 'customer' as any,
      });

      res.status(200).json({
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          hasTransportBox: customer.hasTransportBox,
          pets: customer.pets,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: 'Token de autenticação não fornecido.' });
        return;
      }

      const [, token] = authHeader.split(' ');
      const payload = this.tokenProvider.verifyToken(token);

      const customer = await this.customerRepository.findById(payload.userId);
      if (!customer) {
        res.status(404).json({ message: 'Cliente não encontrado.' });
        return;
      }

      res.status(200).json({
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          hasTransportBox: customer.hasTransportBox,
          pets: customer.pets,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

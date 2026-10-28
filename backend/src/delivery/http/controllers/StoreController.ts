import { Request, Response, NextFunction } from 'express';
import { CreateStoreUseCase } from '../../../domain/use-cases/store/CreateStoreUseCase.js';
import { GetStoreBySlugUseCase } from '../../../domain/use-cases/store/GetStoreBySlugUseCase.js';
import { ListStoresUseCase } from '../../../domain/use-cases/store/ListStoresUseCase.js';
import { UpdateStoreUseCase } from '../../../domain/use-cases/store/UpdateStoreUseCase.js';
import { DeleteStoreUseCase } from '../../../domain/use-cases/store/DeleteStoreUseCase.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';

export class StoreController {
  constructor(
    private readonly createStoreUseCase: CreateStoreUseCase,
    private readonly getStoreBySlugUseCase: GetStoreBySlugUseCase,
    private readonly listStoresUseCase: ListStoresUseCase,
    private readonly updateStoreUseCase: UpdateStoreUseCase,
    private readonly deleteStoreUseCase: DeleteStoreUseCase,
  ) {}

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stores = await this.listStoresUseCase.execute();
      // Isolamento: cliente comum só visualiza sua própria loja; superadmin visualiza todas
      if (req.user && req.user.role !== 'superadmin') {
        const filtered = stores.filter((s) => s.id === req.user?.storeId);
        res.status(200).json(filtered);
        return;
      }
      res.status(200).json(stores);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const store = await this.createStoreUseCase.execute(req.body);
      res.status(201).json(store);
    } catch (err) {
      next(err);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.getStoreBySlugUseCase.execute(slug);
      res.status(200).json(store);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.updateStoreUseCase.execute(slug, req.body);
      res.status(200).json(store);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      await this.deleteStoreUseCase.execute(slug);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public getCalendarLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.getStoreBySlugUseCase.execute(slug);

      const servicoNome = String(req.query.servicoNome || 'Serviço');
      const petNome = String(req.query.petNome || 'Pet');
      const petEspecie = String(req.query.petEspecie || 'cao');
      const tutorNome = String(req.query.tutorNome || 'Cliente');
      const tutorTelefone = String(req.query.tutorTelefone || '');
      const dataAgendada = String(req.query.dataAgendada || '');
      const horario = String(req.query.horario || '09:00');
      const modalidade = String(req.query.modalidade || '');
      const endereco = String(req.query.endereco || '');

      const ownerEmail = String(
        store.config?.empresa?.emailGoogleAgenda ||
        store.config?.empresa?.email ||
        ''
      ).trim();

      const petIcon = petEspecie === 'gato' ? '🐱' : petEspecie === 'ave' ? '🦜' : '🐶';
      const title = `🐾 [${store.name}] ${servicoNome} - ${petIcon} ${petNome} (Tutor: ${tutorNome})`;

      const [year, month, day] = dataAgendada.split('-').map(Number);
      const [hours, minutes] = horario.split(':').map(Number);
      const start = new Date(year || new Date().getFullYear(), (month || 1) - 1, day || new Date().getDate(), hours || 9, minutes || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      const startIso = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
      const endIso = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;

      let details = `AGENDAMENTO DE SERVIÇO - ${store.name}\n\n`;
      details += `• Data: ${dataAgendada.split('-').reverse().join('/')} às ${horario}\n`;
      details += `• Serviço: ${servicoNome}\n`;
      details += `• Pet: ${petNome} (${petEspecie})\n`;
      details += `• Tutor: ${tutorNome} (${tutorTelefone})\n`;
      if (modalidade) details += `• Modalidade: ${modalidade}\n`;
      if (endereco) details += `• Endereço: ${endereco}\n`;

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startIso}/${endIso}`,
        details,
        location: endereco || store.name,
      });

      if (ownerEmail && ownerEmail.includes('@')) {
        params.set('add', ownerEmail);
      }

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

      res.status(200).json({
        googleCalendarUrl,
        ownerEmail: ownerEmail || null,
        title,
        startIso,
        endIso,
      });
    } catch (err) {
      next(err);
    }
  };

  public downloadCalendarIcs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.getStoreBySlugUseCase.execute(slug);

      const servicoNome = String(req.query.servicoNome || 'Serviço');
      const petNome = String(req.query.petNome || 'Pet');
      const tutorNome = String(req.query.tutorNome || 'Cliente');
      const dataAgendada = String(req.query.dataAgendada || '');
      const horario = String(req.query.horario || '09:00');

      const [year, month, day] = dataAgendada.split('-').map(Number);
      const [hours, minutes] = horario.split(':').map(Number);
      const start = new Date(year || new Date().getFullYear(), (month || 1) - 1, day || new Date().getDate(), hours || 9, minutes || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      const startIso = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
      const endIso = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;

      const title = `Agendamento ${servicoNome} - ${petNome} (Tutor: ${tutorNome})`;
      const cleanText = (str = '') => str.replace(/\r?\n/g, '\\n').replace(/,/g, '\\,');

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Catalogo Express//Agendamentos//PT-BR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:agendamento-${Date.now()}@catalogoexpress`,
        `DTSTAMP:${startIso}Z`,
        `DTSTART:${startIso}`,
        `DTEND:${endIso}`,
        `SUMMARY:${cleanText(title)}`,
        `DESCRIPTION:${cleanText(`Serviço: ${servicoNome}\\nPet: ${petNome}\\nTutor: ${tutorNome}`)}`,
        `LOCATION:${cleanText(store.name)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="agendamento-${petNome.toLowerCase().replace(/\\s+/g, '-')}.ics"`);
      res.status(200).send(ics);
    } catch (err) {
      next(err);
    }
  };
}

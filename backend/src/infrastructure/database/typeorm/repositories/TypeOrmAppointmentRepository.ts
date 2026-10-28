import { Repository, Between, In } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Appointment, AppointmentStatus } from '../entities/Appointment.js';
import { IAppointmentRepository } from '../../../../domain/repositories/IAppointmentRepository.js';

export class TypeOrmAppointmentRepository implements IAppointmentRepository {
  private repo: Repository<Appointment>;

  constructor() {
    this.repo = AppDataSource.getRepository(Appointment);
  }

  public async findById(id: string): Promise<Appointment | null> {
    return this.repo.findOne({ where: { id } });
  }

  public async listByStoreSlug(storeSlug: string, status?: AppointmentStatus): Promise<Appointment[]> {
    const where: any = { storeSlug: storeSlug.toLowerCase().trim() };
    if (status) {
      where.status = status;
    }
    return this.repo.find({
      where,
      order: { scheduledDateTime: 'ASC', createdAt: 'DESC' },
    });
  }

  public async create(appointment: Appointment): Promise<Appointment> {
    return this.repo.save(appointment);
  }

  public async update(appointment: Appointment): Promise<Appointment> {
    return this.repo.save(appointment);
  }

  public async updateStatus(id: string, status: AppointmentStatus): Promise<boolean> {
    const res = await this.repo.update({ id }, { status });
    return (res.affected ?? 0) > 0;
  }

  public async findPendingReminders(minDateTime: Date, maxDateTime: Date): Promise<Appointment[]> {
    return this.repo.find({
      where: {
        status: In(['confirmado', 'solicitado']),
        reminderSent: false,
        scheduledDateTime: Between(minDateTime, maxDateTime),
      },
    });
  }
}

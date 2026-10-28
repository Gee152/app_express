import { Appointment, AppointmentStatus } from '../../infrastructure/database/typeorm/entities/Appointment.js';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  listByStoreSlug(storeSlug: string, status?: AppointmentStatus): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<boolean>;
  findPendingReminders(minDateTime: Date, maxDateTime: Date): Promise<Appointment[]>;
}

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type AppointmentStatus = 'solicitado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface AppointmentPetInfo {
  nome: string;
  porte?: string;
  especie?: string;
  raca?: string;
  cuidadosEspeciais?: string;
  hasTransportBox?: boolean;
}

export interface AppointmentTutorInfo {
  nome: string;
  whatsapp: string;
  email?: string;
}

export interface AppointmentProps {
  id?: string;
  storeSlug: string;
  customerId?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  scheduledDateTime?: Date;
  serviceId: string;
  serviceName: string;
  price?: number;
  pet: AppointmentPetInfo;
  tutor: AppointmentTutorInfo;
  status?: AppointmentStatus;
  notes?: string;
  deliveryType?: 'entrega' | 'retirada';
  deliveryAddress?: string;
  googleCalendarUrl?: string;
  reminderSent?: boolean;
  reminderSentAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity('appointments')
export class Appointment {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id!: string;

  @Index('idx_appointments_store_slug')
  @Column({ type: 'varchar', length: 120 })
  storeSlug!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 20 })
  scheduledDate!: string;

  @Column({ type: 'varchar', length: 10 })
  scheduledTime!: string;

  @Index('idx_appointments_scheduled_datetime')
  @Column({ type: 'timestamp with time zone' })
  scheduledDateTime!: Date;

  @Column({ type: 'varchar', length: 100 })
  serviceId!: string;

  @Column({ type: 'varchar', length: 200 })
  serviceName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'jsonb' })
  pet!: AppointmentPetInfo;

  @Column({ type: 'jsonb' })
  tutor!: AppointmentTutorInfo;

  @Index('idx_appointments_status')
  @Column({ type: 'varchar', length: 30, default: 'solicitado' })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 50, default: 'retirada' })
  deliveryType!: 'entrega' | 'retirada';

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryAddress?: string;

  @Column({ type: 'text', nullable: true })
  googleCalendarUrl?: string;

  @Index('idx_appointments_reminder_sent')
  @Column({ type: 'boolean', default: false })
  reminderSent!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reminderSentAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(props?: AppointmentProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.storeSlug = props.storeSlug.toLowerCase().trim();
      this.customerId = props.customerId;
      this.scheduledDate = props.scheduledDate;
      this.scheduledTime = props.scheduledTime;
      this.scheduledDateTime = props.scheduledDateTime || Appointment.calculateDateTime(props.scheduledDate, props.scheduledTime);
      this.serviceId = String(props.serviceId);
      this.serviceName = props.serviceName;
      this.price = Number(props.price) || 0;
      this.pet = props.pet;
      this.tutor = props.tutor;
      this.status = props.status || 'solicitado';
      this.notes = props.notes;
      this.deliveryType = props.deliveryType || 'retirada';
      this.deliveryAddress = props.deliveryAddress;
      this.googleCalendarUrl = props.googleCalendarUrl;
      this.reminderSent = Boolean(props.reminderSent);
      this.reminderSentAt = props.reminderSentAt;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }

  public static calculateDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
  }
}

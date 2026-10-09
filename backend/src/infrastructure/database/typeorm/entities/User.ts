import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './Store.js';

export type UserRole = 'superadmin' | 'owner' | 'staff';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  storeId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50, default: 'owner' })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  storeId!: string | null;

  @ManyToOne(() => Store, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'storeId' })
  store?: Store;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(props?: UserProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.name = props.name;
      this.email = props.email.toLowerCase().trim();
      this.passwordHash = props.passwordHash;
      this.role = props.role || 'owner';
      this.storeId = props.storeId || null;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }

  public updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  public updateProfile(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}

export { User as UserSchema };

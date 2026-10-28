import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Store } from './Store.js';

export interface CustomerPet {
  id: string;
  name: string;
  breed?: string;
  species?: string;
  specialCare?: string;
  hasTransportBox?: boolean;
}

export interface CustomerProps {
  id?: string;
  storeId: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  hasTransportBox?: boolean;
  pets?: CustomerPet[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity('customers')
export class Customer {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_customers_store_id')
  @Column({ type: 'uuid' })
  storeId!: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: Store;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index('idx_customers_store_email')
  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  phone!: string;

  @Column({ type: 'boolean', default: false })
  hasTransportBox!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  pets!: CustomerPet[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(props?: CustomerProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.storeId = props.storeId;
      this.name = props.name.trim();
      this.email = props.email.toLowerCase().trim();
      this.passwordHash = props.passwordHash;
      this.phone = (props.phone || '').trim();
      this.hasTransportBox = Boolean(props.hasTransportBox);
      this.pets = props.pets || [];
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }

  public addPet(pet: Omit<CustomerPet, 'id'> & { id?: string }): void {
    const newPet: CustomerPet = {
      id: pet.id || crypto.randomUUID(),
      name: pet.name.trim(),
      breed: pet.breed?.trim(),
      species: pet.species || 'cao',
      specialCare: pet.specialCare?.trim(),
      hasTransportBox: pet.hasTransportBox ?? this.hasTransportBox,
    };
    this.pets = [...(this.pets || []), newPet];
    this.updatedAt = new Date();
  }
}

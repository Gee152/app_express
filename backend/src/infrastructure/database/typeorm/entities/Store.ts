import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Category } from './Category.js';
import { Product } from './Product.js';
import { StoreSubscription, PlanType, PLAN_DAYS } from '../../../../domain/value-objects/StoreSubscription.js';

export type StoreStatus = 'rascunho' | 'publicada';

export interface StoreConfig {
  nichoId?: string;
  temaId?: string;
  cores?: Record<string, string>;
  empresa?: Record<string, any>;
  camposPersonalizados?: any[];
  [key: string]: any;
}

export interface StoreProps {
  id?: string;
  slug: string;
  name: string;
  whatsapp?: string;
  status?: StoreStatus;
  planType?: PlanType;
  planDays?: number;
  isPaid?: boolean;
  paidAt?: Date | null;
  expiresAt?: Date | null;
  config?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity('stores')
export class Store {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_stores_slug', { unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 30, default: '' })
  whatsapp!: string;

  @Column({ type: 'varchar', length: 30, default: 'rascunho' })
  status!: StoreStatus;

  @Column({ type: 'varchar', length: 20, default: 'mensal' })
  planType!: PlanType;

  @Column({ type: 'int', default: 30 })
  planDays!: number;

  @Index('idx_stores_is_paid')
  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paidAt!: Date | null;

  @Index('idx_stores_expires_at')
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, any>;

  @OneToMany(() => Category, (category: Category) => category.store)
  categories?: Category[];

  @OneToMany(() => Product, (product: Product) => product.store)
  products?: Product[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(props?: StoreProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.slug = Store.sanitizeSlug(props.slug);
      this.name = props.name.trim();
      this.whatsapp = props.whatsapp ? props.whatsapp.replace(/\D/g, '') : '';
      this.status = props.status || 'rascunho';
      this.config = props.config || {};
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();

      // Inicialização dos campos de assinatura com fallback para config.plano legado
      const legacyPlano = props.config?.plano;
      this.planType = props.planType || legacyPlano?.tipo || 'mensal';
      this.planDays = props.planDays || legacyPlano?.dias || PLAN_DAYS[this.planType] || 30;
      this.isPaid = props.isPaid !== undefined ? props.isPaid : (legacyPlano?.pago ?? false);
      this.paidAt = props.paidAt || (legacyPlano?.dataPagamento ? new Date(legacyPlano.dataPagamento) : null);
      this.expiresAt = props.expiresAt || null;

      if (this.isPaid && this.paidAt && !this.expiresAt) {
        this.expiresAt = new Date(this.paidAt.getTime() + this.planDays * 86_400_000);
      }
    }
  }

  public static sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  public publish(): void {
    this.status = 'publicada';
    this.updatedAt = new Date();
  }

  public updateDetails(name: string, whatsapp?: string, config?: Record<string, any>): void {
    this.name = name.trim();
    if (whatsapp !== undefined) {
      this.whatsapp = whatsapp.replace(/\D/g, '');
    }
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.updatedAt = new Date();
  }

  public getSubscription(): StoreSubscription {
    return new StoreSubscription({
      planType: this.planType,
      planDays: this.planDays,
      isPaid: this.isPaid,
      paidAt: this.paidAt,
      expiresAt: this.expiresAt,
    });
  }

  public applySubscription(subscription: StoreSubscription): void {
    this.planType = subscription.planType;
    this.planDays = subscription.planDays;
    this.isPaid = subscription.isPaid;
    this.paidAt = subscription.paidAt;
    this.expiresAt = subscription.expiresAt;
    this.updatedAt = new Date();
  }
}

export { Store as StoreSchema };

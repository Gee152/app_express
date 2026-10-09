import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Store } from './Store.js';
import { Category } from './Category.js';

export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'unica' | 'multipla';
  items: ProductOptionItem[];
}

export interface ProductProps {
  id?: string;
  storeId: string;
  categoryId?: string | null;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  status?: boolean;
  highlight?: boolean;
  order?: number;
  options?: ProductOption[];
  externalLinkActive?: boolean;
  externalLink?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity('products')
@Index('idx_products_store_category', ['storeId', 'categoryId'])
export class Product {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_products_store_id')
  @Column({ type: 'uuid' })
  storeId!: string;

  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: Store;

  @Column({ type: 'uuid', nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  price!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image!: string | null;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @Column({ type: 'boolean', default: false })
  highlight!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  options!: ProductOption[];

  @Column({ type: 'boolean', default: false })
  externalLinkActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalLink!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(props?: ProductProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.storeId = props.storeId;
      this.categoryId = props.categoryId || null;
      this.name = props.name.trim();
      this.description = props.description || '';
      this.price = Math.max(0, props.price);
      this.image = props.image || null;
      this.status = props.status ?? true;
      this.highlight = props.highlight ?? false;
      this.order = props.order ?? 0;
      this.options = props.options || [];
      this.externalLinkActive = props.externalLinkActive ?? false;
      this.externalLink = props.externalLink || null;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }
}

export { Product as ProductSchema };

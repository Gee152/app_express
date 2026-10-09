import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Store } from './Store.js';
import { Product } from './Product.js';

export interface CategoryProps {
  id?: string;
  storeId: string;
  name: string;
  order?: number;
  icon?: string | null;
  createdAt?: Date;
}

@Entity('categories')
export class Category {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_categories_store_id')
  @Column({ type: 'uuid' })
  storeId!: string;

  @ManyToOne(() => Store, (store) => store.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: Store;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @OneToMany(() => Product, (product: Product) => product.category)
  products?: Product[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  constructor(props?: CategoryProps) {
    if (props) {
      this.id = props.id || crypto.randomUUID();
      this.storeId = props.storeId;
      this.name = props.name.trim();
      this.order = props.order ?? 0;
      this.icon = props.icon || null;
      this.createdAt = props.createdAt || new Date();
    }
  }
}

export { Category as CategorySchema };

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = void 0;
const typeorm_1 = require("typeorm");
const StoreSchema_js_1 = require("./StoreSchema.js");
const CategorySchema_js_1 = require("./CategorySchema.js");
let ProductSchema = class ProductSchema {
    id;
    storeId;
    store;
    categoryId;
    category;
    name;
    description;
    price;
    image;
    status;
    highlight;
    order;
    options;
    externalLinkActive;
    externalLink;
    createdAt;
    updatedAt;
};
exports.ProductSchema = ProductSchema;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], ProductSchema.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_products_store_id'),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ProductSchema.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StoreSchema_js_1.StoreSchema, (store) => store.products, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'storeId' }),
    __metadata("design:type", StoreSchema_js_1.StoreSchema)
], ProductSchema.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ProductSchema.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CategorySchema_js_1.CategorySchema, (category) => category.products, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", CategorySchema_js_1.CategorySchema)
], ProductSchema.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], ProductSchema.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], ProductSchema.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.0 }),
    __metadata("design:type", Number)
], ProductSchema.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], ProductSchema.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ProductSchema.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ProductSchema.prototype, "highlight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ProductSchema.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], ProductSchema.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ProductSchema.prototype, "externalLinkActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], ProductSchema.prototype, "externalLink", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ProductSchema.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ProductSchema.prototype, "updatedAt", void 0);
exports.ProductSchema = ProductSchema = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)('idx_products_store_category', ['storeId', 'categoryId'])
], ProductSchema);

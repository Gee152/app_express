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
exports.StoreSchema = void 0;
const typeorm_1 = require("typeorm");
const ProductSchema_js_1 = require("./ProductSchema.js");
const CategorySchema_js_1 = require("./CategorySchema.js");
let StoreSchema = class StoreSchema {
    id;
    slug;
    name;
    whatsapp;
    status;
    config;
    categories;
    products;
    createdAt;
    updatedAt;
};
exports.StoreSchema = StoreSchema;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], StoreSchema.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_stores_slug', { unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, unique: true }),
    __metadata("design:type", String)
], StoreSchema.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], StoreSchema.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], StoreSchema.prototype, "whatsapp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'rascunho' }),
    __metadata("design:type", String)
], StoreSchema.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'" }),
    __metadata("design:type", Object)
], StoreSchema.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CategorySchema_js_1.CategorySchema, (category) => category.store),
    __metadata("design:type", Array)
], StoreSchema.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductSchema_js_1.ProductSchema, (product) => product.store),
    __metadata("design:type", Array)
], StoreSchema.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], StoreSchema.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], StoreSchema.prototype, "updatedAt", void 0);
exports.StoreSchema = StoreSchema = __decorate([
    (0, typeorm_1.Entity)('stores')
], StoreSchema);

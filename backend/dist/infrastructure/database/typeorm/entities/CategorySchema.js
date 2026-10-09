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
exports.CategorySchema = void 0;
const typeorm_1 = require("typeorm");
const StoreSchema_js_1 = require("./StoreSchema.js");
const ProductSchema_js_1 = require("./ProductSchema.js");
let CategorySchema = class CategorySchema {
    id;
    storeId;
    store;
    name;
    order;
    icon;
    products;
    createdAt;
};
exports.CategorySchema = CategorySchema;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], CategorySchema.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_categories_store_id'),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CategorySchema.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StoreSchema_js_1.StoreSchema, (store) => store.categories, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'storeId' }),
    __metadata("design:type", StoreSchema_js_1.StoreSchema)
], CategorySchema.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], CategorySchema.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CategorySchema.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], CategorySchema.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductSchema_js_1.ProductSchema, (product) => product.category),
    __metadata("design:type", Array)
], CategorySchema.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], CategorySchema.prototype, "createdAt", void 0);
exports.CategorySchema = CategorySchema = __decorate([
    (0, typeorm_1.Entity)('categories')
], CategorySchema);

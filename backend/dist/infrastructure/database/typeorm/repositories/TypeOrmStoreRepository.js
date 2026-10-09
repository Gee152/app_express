"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmStoreRepository = void 0;
const data_source_js_1 = require("../data-source.js");
const StoreSchema_js_1 = require("../entities/StoreSchema.js");
const Store_js_1 = require("../../../../domain/entities/Store.js");
class TypeOrmStoreRepository {
    ormRepository;
    constructor() {
        this.ormRepository = data_source_js_1.AppDataSource.getRepository(StoreSchema_js_1.StoreSchema);
    }
    toDomain(schema) {
        return new Store_js_1.Store({
            id: schema.id,
            slug: schema.slug,
            name: schema.name,
            whatsapp: schema.whatsapp,
            status: schema.status,
            config: schema.config,
            createdAt: schema.createdAt,
            updatedAt: schema.updatedAt,
        });
    }
    toSchema(domain) {
        const schema = new StoreSchema_js_1.StoreSchema();
        schema.id = domain.id;
        schema.slug = domain.slug;
        schema.name = domain.name;
        schema.whatsapp = domain.whatsapp;
        schema.status = domain.status;
        schema.config = domain.config;
        schema.createdAt = domain.createdAt;
        schema.updatedAt = domain.updatedAt;
        return schema;
    }
    async findById(id) {
        const schema = await this.ormRepository.findOneBy({ id });
        return schema ? this.toDomain(schema) : null;
    }
    async findBySlug(slug) {
        const schema = await this.ormRepository.findOneBy({ slug });
        return schema ? this.toDomain(schema) : null;
    }
    async listAll() {
        const schemas = await this.ormRepository.find();
        return schemas.map((s) => this.toDomain(s));
    }
    async create(store) {
        const schema = this.toSchema(store);
        const saved = await this.ormRepository.save(schema);
        return this.toDomain(saved);
    }
    async update(store) {
        const schema = this.toSchema(store);
        await this.ormRepository.save(schema);
    }
    async delete(id) {
        await this.ormRepository.delete(id);
    }
}
exports.TypeOrmStoreRepository = TypeOrmStoreRepository;

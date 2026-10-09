"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmUserRepository = void 0;
const data_source_js_1 = require("../data-source.js");
const UserSchema_js_1 = require("../entities/UserSchema.js");
const User_js_1 = require("../../../../domain/entities/User.js");
class TypeOrmUserRepository {
    ormRepository;
    constructor() {
        this.ormRepository = data_source_js_1.AppDataSource.getRepository(UserSchema_js_1.UserSchema);
    }
    toDomain(schema) {
        return new User_js_1.User({
            id: schema.id,
            name: schema.name,
            email: schema.email,
            passwordHash: schema.passwordHash,
            role: schema.role,
            storeId: schema.storeId,
            createdAt: schema.createdAt,
            updatedAt: schema.updatedAt,
        });
    }
    toSchema(domain) {
        const schema = new UserSchema_js_1.UserSchema();
        schema.id = domain.id;
        schema.name = domain.name;
        schema.email = domain.email;
        schema.passwordHash = domain.passwordHash;
        schema.role = domain.role;
        schema.storeId = domain.storeId;
        schema.createdAt = domain.createdAt;
        schema.updatedAt = domain.updatedAt;
        return schema;
    }
    async findById(id) {
        const schema = await this.ormRepository.findOneBy({ id });
        return schema ? this.toDomain(schema) : null;
    }
    async findByEmail(email) {
        const schema = await this.ormRepository.findOneBy({ email: email.toLowerCase().trim() });
        return schema ? this.toDomain(schema) : null;
    }
    async create(user) {
        const schema = this.toSchema(user);
        const saved = await this.ormRepository.save(schema);
        return this.toDomain(saved);
    }
    async update(user) {
        const schema = this.toSchema(user);
        await this.ormRepository.save(schema);
    }
    async delete(id) {
        await this.ormRepository.delete(id);
    }
}
exports.TypeOrmUserRepository = TypeOrmUserRepository;

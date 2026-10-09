"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStoreBySlugUseCase = void 0;
const Store_js_1 = require("../../entities/Store.js");
const EntityNotFoundError_js_1 = require("../../errors/EntityNotFoundError.js");
class GetStoreBySlugUseCase {
    storeRepository;
    constructor(storeRepository) {
        this.storeRepository = storeRepository;
    }
    async execute(slug) {
        const sanitizedSlug = Store_js_1.Store.sanitizeSlug(slug);
        const store = await this.storeRepository.findBySlug(sanitizedSlug);
        if (!store) {
            throw new EntityNotFoundError_js_1.EntityNotFoundError('Loja', slug);
        }
        return store;
    }
}
exports.GetStoreBySlugUseCase = GetStoreBySlugUseCase;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStoreUseCase = exports.SlugAlreadyInUseError = void 0;
const Store_js_1 = require("../../entities/Store.js");
const DomainError_js_1 = require("../../errors/DomainError.js");
class SlugAlreadyInUseError extends DomainError_js_1.DomainError {
    statusCode = 409;
    constructor(slug) {
        super(`A loja com slug "${slug}" já existe.`);
    }
}
exports.SlugAlreadyInUseError = SlugAlreadyInUseError;
class CreateStoreUseCase {
    storeRepository;
    constructor(storeRepository) {
        this.storeRepository = storeRepository;
    }
    async execute(dto) {
        const sanitizedSlug = Store_js_1.Store.sanitizeSlug(dto.slug);
        const existingStore = await this.storeRepository.findBySlug(sanitizedSlug);
        if (existingStore) {
            throw new SlugAlreadyInUseError(sanitizedSlug);
        }
        const store = new Store_js_1.Store({
            name: dto.name,
            slug: sanitizedSlug,
            whatsapp: dto.whatsapp,
            config: dto.config,
            status: 'rascunho',
        });
        return await this.storeRepository.create(store);
    }
}
exports.CreateStoreUseCase = CreateStoreUseCase;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
class StoreController {
    createStoreUseCase;
    getStoreBySlugUseCase;
    constructor(createStoreUseCase, getStoreBySlugUseCase) {
        this.createStoreUseCase = createStoreUseCase;
        this.getStoreBySlugUseCase = getStoreBySlugUseCase;
    }
    create = async (req, res, next) => {
        try {
            const store = await this.createStoreUseCase.execute(req.body);
            res.status(201).json(store);
        }
        catch (err) {
            next(err);
        }
    };
    getBySlug = async (req, res, next) => {
        try {
            const { slug } = req.params;
            const store = await this.getStoreBySlugUseCase.execute(slug);
            res.status(200).json(store);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.StoreController = StoreController;

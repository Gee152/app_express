"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    id;
    storeId;
    categoryId;
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
    constructor(props) {
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
    updatePrice(newPrice) {
        if (newPrice < 0) {
            throw new Error('Preço não pode ser negativo.');
        }
        this.price = newPrice;
        this.updatedAt = new Date();
    }
}
exports.Product = Product;

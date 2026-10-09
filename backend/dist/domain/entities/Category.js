"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
class Category {
    id;
    storeId;
    name;
    order;
    icon;
    createdAt;
    constructor(props) {
        this.id = props.id || crypto.randomUUID();
        this.storeId = props.storeId;
        this.name = props.name.trim();
        this.order = props.order ?? 0;
        this.icon = props.icon || null;
        this.createdAt = props.createdAt || new Date();
    }
}
exports.Category = Category;

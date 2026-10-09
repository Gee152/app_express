"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
class Store {
    id;
    slug;
    name;
    whatsapp;
    status;
    config;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id || crypto.randomUUID();
        this.slug = Store.sanitizeSlug(props.slug);
        this.name = props.name.trim();
        this.whatsapp = props.whatsapp.replace(/\D/g, '');
        this.status = props.status || 'rascunho';
        this.config = props.config || {};
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static sanitizeSlug(slug) {
        return slug
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    publish() {
        this.status = 'publicada';
        this.updatedAt = new Date();
    }
    updateDetails(name, whatsapp, config) {
        this.name = name.trim();
        this.whatsapp = whatsapp.replace(/\D/g, '');
        if (config) {
            this.config = { ...this.config, ...config };
        }
        this.updatedAt = new Date();
    }
}
exports.Store = Store;

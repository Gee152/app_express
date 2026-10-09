"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    name;
    email;
    passwordHash;
    role;
    storeId;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id || crypto.randomUUID();
        this.name = props.name;
        this.email = props.email.toLowerCase().trim();
        this.passwordHash = props.passwordHash;
        this.role = props.role || 'owner';
        this.storeId = props.storeId || null;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    updatePassword(newPasswordHash) {
        this.passwordHash = newPasswordHash;
        this.updatedAt = new Date();
    }
    updateProfile(name) {
        this.name = name;
        this.updatedAt = new Date();
    }
}
exports.User = User;

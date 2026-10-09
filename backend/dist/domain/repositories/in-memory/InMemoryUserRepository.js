"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUserRepository = void 0;
class InMemoryUserRepository {
    users = [];
    async findById(id) {
        const user = this.users.find((u) => u.id === id);
        return user || null;
    }
    async findByEmail(email) {
        const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
    }
    async create(user) {
        this.users.push(user);
        return user;
    }
    async update(user) {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
            this.users[index] = user;
        }
    }
    async delete(id) {
        this.users = this.users.filter((u) => u.id !== id);
    }
}
exports.InMemoryUserRepository = InMemoryUserRepository;

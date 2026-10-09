"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHashProvider = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptHashProvider {
    saltRounds = 10;
    async generateHash(payload) {
        return bcrypt_1.default.hash(payload, this.saltRounds);
    }
    async compareHash(payload, hashed) {
        return bcrypt_1.default.compare(payload, hashed);
    }
}
exports.BcryptHashProvider = BcryptHashProvider;

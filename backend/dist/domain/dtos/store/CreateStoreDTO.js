"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStoreDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateStoreDTO {
    name;
    slug;
    whatsapp;
    config;
}
exports.CreateStoreDTO = CreateStoreDTO;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome da loja deve ser um texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome da loja é obrigatório.' }),
    (0, class_validator_1.MinLength)(2, { message: 'O nome da loja deve ter ao menos 2 caracteres.' }),
    __metadata("design:type", String)
], CreateStoreDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O slug deve ser um texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O slug da loja é obrigatório.' }),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'O slug deve conter apenas letras minúsculas, números e hífens.' }),
    __metadata("design:type", String)
], CreateStoreDTO.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O número de WhatsApp deve ser um texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O número de WhatsApp é obrigatório.' }),
    __metadata("design:type", String)
], CreateStoreDTO.prototype, "whatsapp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'A configuração da loja deve ser um objeto JSON.' }),
    __metadata("design:type", Object)
], CreateStoreDTO.prototype, "config", void 0);

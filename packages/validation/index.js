"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.PartnerRegistrationSchema = zod_1.z.object({
    company_name: zod_1.z.string().min(1),
    cnpj: zod_1.z.string().optional(),
    trading_name: zod_1.z.string().optional(),
    contact_email: zod_1.z.string().email(),
});
exports.default = {};
//# sourceMappingURL=index.js.map
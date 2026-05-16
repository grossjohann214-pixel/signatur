"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.EnvSchema = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
exports.EnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().optional(),
    NODE_ENV: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(8),
});
exports.env = exports.EnvSchema.safeParse(process.env);
if (!exports.env.success) {
    console.warn('Env validation warnings:', exports.env.error.format());
}
exports.default = exports.env;
//# sourceMappingURL=index.js.map
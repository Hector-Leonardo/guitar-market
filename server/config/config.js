import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env (en la raíz del proyecto)
dotenv.config({ path: join(__dirname, '../../.env') });

export const PORT = process.env.PORT || 3000;
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';

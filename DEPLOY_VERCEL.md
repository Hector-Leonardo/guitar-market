# 🚀 Deploy a Vercel - Guía Completa

## 📋 Opciones de Deploy

Tu proyecto es **full-stack** (React + Node.js + Firebase), así que tienes 3 opciones:

### **Opción 1: Recomendada - Vercel + Railway (Mejor relación costo-beneficio)**

#### Paso 1: Configurar Backend en Railway
1. Ir a https://railway.app
2. Conectar tu repositorio de GitHub
3. Crear nuevo proyecto y seleccionar el branch
4. Railway detectará el `package.json` y configurará automáticamente
5. Agregar variables de entorno en Railway:
   ```
   FIREBASE_PROJECT_ID=guitarmarket-b033a
   GOOGLE_APPLICATION_CREDENTIALS=<contenido del JSON>
   MP_ACCESS_TOKEN=<tu token>
   CLOUDINARY_CLOUD_NAME=dtkwn8jao
   CLOUDINARY_API_KEY=524377538286147
   CLOUDINARY_API_SECRET=<tu secret>
   PORT=3000
   ```
6. Railway generará una URL pública para el backend (ej: https://guitarmarket-backend.railway.app)

#### Paso 2: Configurar Frontend en Vercel
1. Ir a https://vercel.com
2. Conectar tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite
4. Agregar variable de entorno:
   ```
   VITE_API_URL=https://guitarmarket-backend.railway.app
   ```
5. Deploy automático en cada push

#### Ventajas:
- ✅ Vercel = gratis para frontend
- ✅ Railway = $5/mes (muy barato)
- ✅ Ambos tienen CI/CD automático
- ✅ Auto-redeploy en cada git push

---

### **Opción 2: Vercel Serverless Functions**

Convertir el backend Express a funciones serverless de Vercel.

**Pros:** Todo en un lugar
**Contras:** Requiere refactorizar código, limitaciones de tiempo de ejecución

---

### **Opción 3: Heroku (Alternativa)**

**Pros:** Fácil para apps full-stack
**Contras:** Gratuito deprecado, requiere pago

---

## 🔧 Preparación del Proyecto (Todos las opciones)

### 1. Verificar que esté en Git:
```bash
git init
git add .
git commit -m "Project setup"
```

### 2. Crear `.env.example` (sin valores sensibles):
```bash
VITE_API_URL=https://guitarmarket-backend.railway.app
FIREBASE_PROJECT_ID=guitarmarket-b033a
GOOGLE_APPLICATION_CREDENTIALS=<path-to-credentials>
MP_ACCESS_TOKEN=<tu-token>
CLOUDINARY_CLOUD_NAME=dtkwn8jao
CLOUDINARY_API_KEY=524377538286147
CLOUDINARY_API_SECRET=<tu-secret>
```

### 3. Verificar `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

### 4. Actualizar URLs de API en desarrollo/producción:

En `src/services/userService.ts`:
```typescript
const API_BASE = process.env.VITE_API_URL || '/api'
```

---

## 📲 Pasos Finales para Vercel + Railway

### En Railway:

1. **Crear nuevo proyecto**
   - https://railway.app/dashboard
   - "New Project" → "Deploy from GitHub"
   - Seleccionar tu repo
   - Esperar a que detecte Node.js

2. **Configurar variables**
   - Variables → Add → Pegar las variables de `.env`

3. **Ver URL pública**
   - El proyecto mostrará: `https://guitarmarket-backend-production.railway.app`
   - Copiar esta URL

### En Vercel:

1. **Crear nuevo proyecto**
   - https://vercel.com/new
   - Conectar GitHub repo
   - Vercel detectará Vite automáticamente

2. **Configurar Environment Variables**
   - Settings → Environment Variables
   - Agregar: `VITE_API_URL=https://guitarmarket-backend-production.railway.app`

3. **Deploy**
   - Click "Deploy"
   - Vercel compilará y desplegará automáticamente

---

## ✅ Verificar Deploy

Una vez desplegado:

```bash
# Frontend en Vercel
https://guitarmarket.vercel.app

# Backend en Railway
https://guitarmarket-backend.railway.app/api/debug/firestore
```

Probar endpoints:
```bash
curl https://guitarmarket-backend.railway.app/api/users
```

---

## 📝 Checklist Final

- [ ] Proyecto en GitHub (git init, git push)
- [ ] `.env` con variables correctas localmente
- [ ] `.env.example` commitado sin valores sensibles
- [ ] `package.json` con build script correcto
- [ ] `vite.config.ts` configurado
- [ ] URLs de API apuntando a la URL correcta
- [ ] Railway backend desplegado
- [ ] Vercel frontend desplegado
- [ ] Variables de entorno en ambas plataformas
- [ ] Testing en producción

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
- Verificar que `npm install` fue ejecutado
- Verificar que todas las dependencias están en `package.json`

### Error: "API is undefined"
- Verificar que `VITE_API_URL` está configurada en Vercel
- Verificar que el backend en Railway está corriendo

### CORS errors
- Backend debe tener CORS habilitado (ya lo tiene)
- Verificar que frontend tiene la URL correcta del backend

### Firebase connection fails
- Verificar que `GOOGLE_APPLICATION_CREDENTIALS` es un JSON válido
- Verificar que `FIREBASE_PROJECT_ID` es correcto

---

## 💡 Tips Adicionales

1. **Auto-redeploy automático**: Solo hacer push a GitHub, ambas plataformas se redesplegarán automáticamente

2. **Logs en tiempo real**:
   - Railway: Dashboard → Project → Logs
   - Vercel: Dashboard → Project → Deployments → Logs

3. **Custom domain**: 
   - Vercel: Settings → Domains → Add custom domain
   - Railway: Settings → Public networking (genera URL pública)

4. **Monitoreo**: 
   - Railway tiene uptime monitoring
   - Vercel tiene analytics

---

¿Necesitas ayuda con algún paso específico?

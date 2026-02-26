# Sunu Santé - Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway

## Step 1: Create PostgreSQL Database on Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Wait for the database to be created
5. Go to the "Connect" tab and copy the "Database URL"

## Step 2: Deploy Backend to Railway

1. In your Railway project, click "New"
2. Select "Deploy from GitHub repo"
3. Choose your repository (binteldigital/Sant-SN)
4. Railway will automatically detect the Node.js app

### Environment Variables

Add these environment variables in Railway Dashboard:

```
DATABASE_URL=postgresql://... (from Step 1)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://sant-sn-5lx4.vercel.app
```

### Deploy Settings

The `railway.json` and `Procfile` are already configured.

## Step 3: Initialize Database

After deployment, run these commands in Railway:

1. Go to your service → "Deploy" tab
2. Click on "Deploy logs"
3. Once deployed, go to "Settings" → "Deploy"
4. Click "Deploy" to trigger a new deployment

### Run Database Schema

Connect to your database and run the schema:

```bash
# Using Railway CLI (install first: npm i -g @railway/cli)
railway login
railway connect

# Or use the Railway dashboard SQL console
# Copy contents of database/schema.sql and execute
```

### Seed Initial Data

```bash
# Run migration script
npm run db:migrate

# Seed admin user and demo data
npm run db:seed
```

## Step 4: Update Frontend Environment

Create `.env.production` in the frontend:

```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

Replace `your-railway-app` with your actual Railway domain.

## Step 5: Redeploy Frontend

Push changes to GitHub, Vercel will automatically redeploy.

## Demo Credentials

After seeding, use these credentials:

- **Admin**: admin@sunusante.sn / admin123
- **Patient**: patient@demo.sn / patient123
- **Doctor**: doctor@demo.sn / doctor123
- **Hospital Admin**: hospital.admin@demo.sn / admin123

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database is in the same region as the app

### CORS Errors
- Update FRONTEND_URL in Railway environment variables
- Ensure it matches your Vercel URL exactly

### API Not Responding
- Check Railway logs for errors
- Verify the health endpoint: `/api/health`

## Support

For issues, check:
1. Railway logs (Dashboard → Service → Deploy → Logs)
2. Browser console for frontend errors
3. Network tab for API request failures

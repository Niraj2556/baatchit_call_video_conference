# Backend Deployment Guide

## Step 1: Prepare Repository
1. Create a new GitHub repository for the backend
2. Copy all files from the `backend` folder to the new repository
3. Push to GitHub

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your backend GitHub repository
4. Vercel will auto-detect it as a Node.js project

## Step 3: Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://your-username:your-password@cluster.mongodb.net/your-database
JWT_SECRET = your-secure-random-string-here
CORS_ORIGIN = https://your-frontend-domain.vercel.app
```

## Step 4: Deploy
Click "Deploy" - Vercel will build and deploy your backend.

## Step 5: Test
Your backend will be available at: `https://your-backend-name.vercel.app`
Test the health endpoint: `https://your-backend-name.vercel.app/health`

## Important Notes
- Replace MongoDB credentials with your own
- Generate a secure JWT_SECRET (use a random string generator)
- Update CORS_ORIGIN after deploying frontend
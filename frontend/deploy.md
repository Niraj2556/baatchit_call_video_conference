# Frontend Deployment Guide

## Step 1: Update Configuration
1. Open `/public/js/config.js`
2. Replace `'https://your-backend-domain.vercel.app'` with your actual backend URL from Step 5 of backend deployment

## Step 2: Prepare Repository
1. Create a new GitHub repository for the frontend
2. Copy all files from the `frontend` folder to the new repository
3. Push to GitHub

## Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your frontend GitHub repository
4. Vercel will auto-detect it as a static site

## Step 4: Deploy
Click "Deploy" - Vercel will build and deploy your frontend.

## Step 5: Update Backend CORS
1. Go to your backend Vercel project
2. Update the `CORS_ORIGIN` environment variable with your frontend URL
3. Redeploy the backend

## Step 6: Test
Your frontend will be available at: `https://your-frontend-name.vercel.app`

## Important Notes
- Make sure both deployments use HTTPS
- Update backend CORS settings after frontend deployment
- Test the complete flow: registration, login, video calls
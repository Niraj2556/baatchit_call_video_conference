# Repository Separation Guide

## Quick Setup Commands

### For Backend Repository:
```bash
# Create new directory for backend
mkdir baat-chit-backend
cd baat-chit-backend

# Initialize git
git init

# Copy backend files (adjust paths as needed)
# Copy all files from chat_call_proj/backend/ to this directory

# Add and commit
git add .
git commit -m "Initial backend setup for Vercel deployment"

# Add remote and push
git remote add origin https://github.com/yourusername/baat-chit-backend.git
git push -u origin main
```

### For Frontend Repository:
```bash
# Create new directory for frontend
mkdir baat-chit-frontend
cd baat-chit-frontend

# Initialize git
git init

# Copy frontend files (adjust paths as needed)
# Copy all files from chat_call_proj/frontend/ to this directory

# Add and commit
git add .
git commit -m "Initial frontend setup for Vercel deployment"

# Add remote and push
git remote add origin https://github.com/yourusername/baat-chit-frontend.git
git push -u origin main
```

## Files Added for Deployment:

### Backend:
- `vercel.json` - Vercel configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `deploy.md` - Deployment instructions
- Updated `src/app.js` - Environment variable support
- Updated `src/routes/auth.js` - Environment variable for JWT

### Frontend:
- `vercel.json` - Vercel configuration
- `.gitignore` - Git ignore rules
- `public/js/config.js` - Environment configuration
- `deploy.md` - Deployment instructions
- Updated `public/js/utils/constants.js` - Dynamic backend URL

## Next Steps:
1. Create GitHub repositories
2. Follow the deployment guides in each folder
3. Update configuration files with actual URLs
4. Test the complete application
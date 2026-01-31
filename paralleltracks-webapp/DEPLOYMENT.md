# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)
- This repository pushed to GitHub

### Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ParallelTracks voting webapp"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In the Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xihfenboeoypghatehhl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a production URL (e.g., `your-project.vercel.app`)

5. **Automatic Deployments**
   - Any push to `main` branch will trigger automatic deployment
   - Pull requests get preview deployments

### Build Settings (Auto-detected)
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Vercel CLI (Optional)

Install Vercel CLI for local testing:
```bash
npm install -g vercel
```

Deploy from command line:
```bash
vercel
```

## Testing Deployment

After deployment:

1. Visit your Vercel URL
2. Verify the voting page loads
3. Check if current state is fetched from Supabase
4. Test voting functionality
5. Check the leaderboard page
6. Test on mobile devices

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Monitoring

- **Build Logs:** Check in Vercel dashboard → Deployments
- **Runtime Logs:** Available in Vercel dashboard → Functions
- **Analytics:** Enable in project settings

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure all dependencies are in package.json

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection is working
- Check real-time subscriptions are enabled

### Common Issues

**"Failed to fetch current state"**
- Verify environment variables are correct
- Check Supabase Edge Function is deployed
- Verify network connectivity

**"Real-time updates not working"**
- Ensure Supabase Realtime is enabled
- Check browser supports WebSockets
- Verify subscription filters are correct

## Production Checklist

- [ ] Environment variables configured
- [ ] App builds successfully
- [ ] Voting functionality works
- [ ] Real-time updates work
- [ ] Leaderboard displays correctly
- [ ] Mobile responsive design verified
- [ ] Error handling tested
- [ ] Custom domain configured (if applicable)

## Performance Optimization

Vercel automatically provides:
- Edge caching
- Image optimization
- Compression
- SSL certificates
- DDoS protection

## Scaling

The free Vercel tier includes:
- 100 GB bandwidth
- Unlimited deployments
- Automatic SSL

For higher traffic, upgrade to Pro tier.

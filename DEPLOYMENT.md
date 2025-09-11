# Deployment Guide

## Quick Start - Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it `cross-country-tracker` (or your preferred name)
5. Make it **Public** (required for free GitHub Pages)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

Run these commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/cross-country-tracker.git

# Push your code to GitHub
git push -u origin main
```

### Step 3: Set up GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **GitHub Actions**
5. The GitHub Action workflow will automatically deploy your site

### Step 4: Add Environment Variables

1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these three secrets:

   **Secret 1:**
   - Name: `GOOGLE_SHEETS_SPREADSHEET_ID`
   - Value: Your Google Spreadsheet ID (from the URL)

   **Secret 2:**
   - Name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: Your service account email

   **Secret 3:**
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Your service account private key (the entire JSON key content)

### Step 5: Deploy!

1. Go to the **Actions** tab in your repository
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your site will be live at:
   `https://YOUR_USERNAME.github.io/cross-country-tracker`

### Step 6: Set up Race Schedule Data

1. In your Google Spreadsheet, create a new sheet called "Race Dates"
2. Add these columns:
   - Column A: Race Name
   - Column B: Race Date (format: MM/DD/YYYY)
   - Column C: Location (optional)
   - Column D: Notes (optional)
3. Add your 2025 race schedule data
4. The schedule will automatically appear in your deployed app!

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Make sure your Google Spreadsheet is shared with the service account email
- Check the Actions tab for detailed error messages

### Site Not Loading
- Wait a few minutes for GitHub Pages to propagate
- Check that the repository is public
- Verify the Pages source is set to "GitHub Actions"

### Data Not Showing
- Ensure your Google Spreadsheet has the correct structure
- Check that the service account has access to the spreadsheet
- Verify environment variables are set correctly

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The built files will be in the 'out' directory
# Upload the contents of 'out' to any web server
```

## Support

If you run into issues, check:
1. The GitHub Actions logs in the Actions tab
2. Your environment variables are set correctly
3. Your Google Sheets API is working locally

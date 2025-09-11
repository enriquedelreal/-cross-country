# Cross Country Performance Tracker

A production-ready web application for tracking high school Cross Country performance using Google Sheets as the data source. Built with Next.js 15, TypeScript, and modern UI components.

## Features

- **Real-time Data**: Live updates from Google Sheets with caching for fast performance
- **Team Dashboard**: Overview of team performance, top seven, and most improved runners
- **Individual Tracking**: Detailed runner profiles with progress charts and race history
- **Runner Comparison**: Compare up to 7 runners with interactive charts
- **Coach-Friendly Metrics**: 3-mile equivalents, improvement percentages, and pace calculations
- **Race Schedule**: Interactive 2025 race schedule with countdown timers
- **Print Reports**: Easy runner report generation
- **Export Functionality**: CSV export for individual runner data
- **Mobile-First Design**: Responsive varsity-style interface
- **Performance Optimized**: Skeleton loading, data caching, and parallel data fetching

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Lucide React icons
- **Charts**: Recharts
- **Data Source**: Google Sheets API
- **Authentication**: Google Service Account (JWT)
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cross-country-tracker
npm install
```

### 2. Set Up Google Sheets

#### Create a Google Sheet with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Runner | Runner's name | "John Smith" |
| Race Date | Date of the race | "2024-09-15" |
| Race Name | Name of the meet | "Regional Championship" |
| Time | Race time | "15:38.30" or "18:44" |
| Distance (mi) | Distance in miles | 3, 3.11, 2.9 |
| 3-mi equiv (sec) | 3-mile equivalent in seconds (optional) | 900 |
| Improvement | Text notes (optional) | "PR!" |

#### Supported Time Formats:
- `M:SS` (e.g., "5:11")
- `MM:SS` (e.g., "18:44")
- `MM:SS.xx` (e.g., "15:38.30")

#### Supported Distances:
- 3.0 miles (standard 3-mile)
- 3.11 miles (5K)
- 2.112 miles (3400m)
- 2.9 miles (common course distance)
- Any other distance (linear scaling applied)

### 3. Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Go to "Credentials" → "Create Credentials" → "Service Account"
5. Create a service account and download the JSON key file
6. Share your Google Sheet with the service account email (Editor permissions)

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_WORKSHEET=Sheet1

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Team Configuration
TEAM_NAME="Your Team Name"
TOP_SEVEN_SIZE=7

# Optional: For webhook revalidation
REVALIDATE_SECRET=your_secret_key_here
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Deploy to GitHub Pages

This project is configured for GitHub Pages deployment with automatic builds.

#### Prerequisites
1. A GitHub repository
2. Google Sheets API credentials (see setup section above)

#### Steps to Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set up GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"

3. **Add Environment Variables**:
   - Go to "Settings" → "Secrets and variables" → "Actions"
   - Add these repository secrets:
     - `GOOGLE_SHEETS_SPREADSHEET_ID`: Your Google Spreadsheet ID
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your service account email
     - `GOOGLE_SERVICE_ACCOUNT_KEY`: Your service account private key

4. **Deploy**:
   - The GitHub Action will automatically build and deploy on every push to main
   - Your site will be available at `https://yourusername.github.io/your-repo-name`

#### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
npm run build
# The built files will be in the 'out' directory
# Upload the contents of 'out' to your web server
```

### Deploy to Vercel (Alternative)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Real-time Updates (Optional)

To enable near real-time updates when your Google Sheet changes:

### 1. Set up Google Apps Script

1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Replace the default code with:

```javascript
function onEdit(e) {
  const webhookUrl = 'https://your-app.vercel.app/api/revalidate?secret=your_secret_key_here';
  
  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Revalidation triggered');
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
  }
}
```

4. Save and authorize the script
5. Test by editing a cell in your sheet

### 2. Alternative: Time-based Trigger

For automatic updates every hour:

```javascript
function createTimeTrigger() {
  ScriptApp.newTrigger('onEdit')
    .timeBased()
    .everyHours(1)
    .create();
}
```

## Customization

### Team Colors and Branding

Update the CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0); /* Your primary color */
  --secondary: oklch(0.97 0 0); /* Your secondary color */
}
```

### Team Name

Set the `TEAM_NAME` environment variable:

```env
TEAM_NAME="Your School Name"
```

### Top Seven Size

Adjust the number of top runners displayed:

```env
TOP_SEVEN_SIZE=7
```

## Data Processing

### 3-Mile Equivalent Calculation

The app automatically calculates 3-mile equivalents using these formulas:

- **5K (3.11 mi)**: `equiv3miSec = seconds * (3 / 3.11)`
- **3400m (2.112 mi)**: `equiv3miSec = seconds * (3 / 2.112)`
- **2.9 mi**: `equiv3miSec = seconds * (3 / 2.9)`
- **Other distances**: `equiv3miSec = seconds * (3 / distanceMi)`

### Improvement Calculations

- **Season Improvement**: `(first_race_time - latest_race_time) / first_race_time * 100`
- **vs Previous Race**: `previous_equiv - current_equiv`
- **vs Season Best**: `best_equiv - current_equiv`

## API Endpoints

- `GET /` - Dashboard
- `GET /runner/[name]` - Individual runner page
- `GET /compare?names=runner1,runner2` - Runner comparison
- `POST /api/revalidate?secret=...` - Trigger cache revalidation

## Troubleshooting

### Common Issues

1. **"Missing Google Service Account credentials"**
   - Check that all environment variables are set correctly
   - Ensure the private key is properly formatted with `\n` for newlines

2. **"Failed to fetch race data"**
   - Verify the spreadsheet ID is correct
   - Check that the service account has Editor access to the sheet
   - Ensure the worksheet name matches your sheet tab

3. **Time parsing errors**
   - Verify time format matches supported formats (M:SS, MM:SS, MM:SS.xx)
   - Check for extra spaces or invalid characters

4. **Charts not displaying**
   - Ensure you have race data in your sheet
   - Check browser console for JavaScript errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the GitHub issues
3. Create a new issue with detailed information

---

Built with ❤️ for cross country coaches and athletes.
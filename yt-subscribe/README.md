# yt-subscribe

A small Node.js utility to subscribe to YouTube channels from a CSV file using the YouTube Data API.

## Requirements

- Node.js 18+ or compatible runtime
- A Google API OAuth 2.0 client credential file named `credentials.json`
- A CSV file named `subscriptions.csv` with a `Link` column

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Google Cloud project and OAuth 2.0 client credentials:

   - Go to the Google Cloud Console: https://console.cloud.google.com/
   - Create or select a project.
   - Enable the YouTube Data API for the project.
   - Go to APIs & Services > OAuth consent screen and configure it for External or Internal usage.
   - Go to APIs & Services > Credentials, click "Create Credentials", and choose "OAuth client ID".
   - Select "Desktop app" as the application type.
   - Download the JSON file and save it as `credentials.json` in this folder.

3. Create `subscriptions.csv` with one `Link` value per row, for example:

```csv
Link
https://www.youtube.com/@SomeCreator
https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxx
```

4. Run the script:

```bash
node subscribe.js
```

On first run, the script will prompt you to authorize the app and save a `token.json` file for future authenticated requests.

## Notes

- `credentials.json`, `token.json`, and all CSV files are ignored by the repository via `.gitignore`.
- The script uses the `youtube.subscriptions.insert` API call to subscribe the authenticated account to each channel.
- Invalid or unresolved channel identifiers are skipped.

## Files

- `subscribe.js` - main subscription script
- `subscriptions.csv` - channel list input file
- `credentials.json` - OAuth client credentials (not committed)
- `token.json` - saved access token after authorization (not committed)

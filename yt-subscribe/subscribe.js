import fs from 'fs';
import csv from 'csv-parser';
import readline from 'readline';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_PATH = 'token.json';
const CSV_FILE_PATH = 'failed_links.csv'; 

const loadChannelsFromCSV = async (filePath) => {
    const channels = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.Link) channels.push(row.Link.trim());
            })
            .on('end', () => resolve(channels))
            .on('error', (err) => reject(err));
    });
};

const cleanChannelIdentifier = (urlOrHandle) => {
    if (!urlOrHandle.includes('youtube.com')) {
        return urlOrHandle; 
    }
    const parts = urlOrHandle.split('/');
    return parts[parts.length - 1];
};

const getChannelId = async (youtube, identifier) => {
    if (identifier.startsWith('UC') && identifier.length === 24) {
        return identifier; 
    }
    
    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: identifier,
            type: 'channel',
            maxResults: 1
        });
        
        const items = response.data.items;
        if (items && items.length > 0) {
            return items[0].id.channelId;
        }
    } catch (error) {
        console.error(`Error finding channel ID for ${identifier}:`, error.message);
    }
    return null;
};

const subscribeToChannel = async (youtube, channelId) => {
    try {
        await youtube.subscriptions.insert({
            part: 'snippet',
            requestBody: {
                snippet: {
                    resourceId: {
                        kind: 'youtube#channel',
                        channelId: channelId
                    }
                }
            }
        });
        return true;
    } catch (error) {
        console.error(`Failed to subscribe to ${channelId}:`, error.message);
        return false;
    }
};

async function main() {
    const credentialsContent = fs.readFileSync('credentials.json');
    const credentials = JSON.parse(credentialsContent);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
    } else {
        await getNewToken(oAuth2Client);
    }

    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });
    
    console.log('Reading CSV...');
    const rawChannels = await loadChannelsFromCSV(CSV_FILE_PATH);
    console.log(`Found ${rawChannels.length} entries in CSV.`);

    for (const raw of rawChannels) {
        const identifier = cleanChannelIdentifier(raw);
        console.log(`Processing: ${identifier}...`);
        
        const channelId = await getChannelId(youtube, identifier);
        if (!channelId) {
            console.log(`Could not resolve ID for ${identifier}. Skipping.`);
            continue;
        }

        const success = await subscribeToChannel(youtube, channelId);
        if (success) {
            console.log(`Successfully subscribed to ${identifier} (${channelId})`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    console.log('Finished processing links.');
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url:\n', authUrl);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    return new Promise((resolve) => {
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
                resolve();
            });
        });
    });
}

main().catch(console.error);
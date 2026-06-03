import fs from 'fs';
import csv from 'csv-parser';
import readline from 'readline';

const ORIGINAL_CSV = 'subscriptions.csv';
const FAILED_OUTPUT_CSV = 'failed_links.csv';

const getSuccessHandles = (logText) => {
    const successSet = new Set();
    const regex = /Successfully subscribed to \/@([a-zA-Z0-9_\-\.%]+)/g;
    let match;
    while ((match = regex.exec(logText)) !== null) {
        successSet.add(`/@${match[1]}`);
    }
    return successSet;
};

const filterCSV = (terminalLog) => {
    const successes = getSuccessHandles(terminalLog);
    const failedRows = [];
    let headers = [];

    if (!fs.existsSync(ORIGINAL_CSV)) {
        console.error(`\nError: Cannot find your original file: "${ORIGINAL_CSV}". Make sure it is in this folder.`);
        return;
    }

    fs.createReadStream(ORIGINAL_CSV)
        .pipe(csv())
        .on('headers', (hdrList) => {
            headers = hdrList;
        })
        .on('data', (row) => {
            if (row.Link) {
                const cleanLink = row.Link.trim();
                const pathEnd = cleanLink.substring(cleanLink.lastIndexOf('/'));
                
                if (!successes.has(pathEnd) && !successes.has(cleanLink)) {
                    failedRows.push(row);
                }
            }
        })
        .on('end', () => {
            const csvContent = [];
            csvContent.push(headers.join(','));
            
            for(const row of failedRows) {
                const line = headers.map(h => {
                    const cell = row[h] || '';
                    return cell.includes(',') ? `"${cell}"` : cell;
                }).join(',');
                csvContent.push(line);
            }

            fs.writeFileSync(FAILED_OUTPUT_CSV, csvContent.join('\n'));
            console.log(`\nSuccess!`);
            console.log(`Filtered out ${successes.size} successfully subscribed channels.`);
            console.log(`Saved ${failedRows.length} failed/skipped channels into: "${FAILED_OUTPUT_CSV}"`);
        });
};

const askForLog = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("================================================================");
    console.log("1. Paste your terminal logs below.");
    console.log("2. When completely done pasting, type 'DONE' on a new line and press Enter.");
    console.log("================================================================\n");

    let lines = [];

    rl.on('line', (line) => {
        if (line.trim() === 'DONE') {
            rl.close();
        } else {
            lines.push(line);
        }
    });

    rl.on('close', () => {
        const fullLog = lines.join('\n');
        console.log('\nProcessing log input...');
        filterCSV(fullLog);
    });
};

askForLog();
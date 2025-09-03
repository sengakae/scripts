import fs from 'fs';
import csv from 'csv-parser';
import { input } from '@inquirer/prompts';
import clipboardy from 'clipboardy';
import path from 'path';

const getCSVFilePath = async () => {
    const answer = await input(
        {
            type: 'input',
            name: 'filePath',
            message: 'Enter CSV path:',
            validate: (input) => {
                return (fs.existsSync(input) && path.extname(input) === '.csv');
            }
        }
    )

    return answer;
}

const importLinks = async (filePath) => {
    const links = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                links.push(row.Link)
            })
            .on('end', () => {
                resolve(links);
            })
            .on('error', (err) => {
                reject(err);
            })
    })
}

(async () => {
    try {
        const csvFilePath = await getCSVFilePath();
        const links = await importLinks(csvFilePath);
        console.log(`Loaded ${links.length} channels.`);
        await clipboardy.write(links.join('\n'));
        console.log('Links copied to clipboard.')
    } catch (err) {
        console.error('Error: ', err)
    }
})();
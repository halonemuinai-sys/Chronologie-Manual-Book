import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { QRCodeCanvas } from '@loskir/styled-qr-code-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = 'D:\\Private Project\\QR CODE Chronologie\\files manual guie';
const PUBLIC_DOCS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'docs');
const OUTPUTS_QR_VIEW_DIR = path.join(ROOT_DIR, 'outputs', 'qr_view');
const OUTPUTS_QR_DOWNLOAD_DIR = path.join(ROOT_DIR, 'outputs', 'qr_download');
const MAPPING_FILE = path.join(ROOT_DIR, 'src', 'config', 'mapping.json');
// Menggunakan domain Vercel Anda secara langsung
const BASE_URL_VIEW = 'https://chronologie-manual-book.vercel.app/m/';
const BASE_URL_DOWNLOAD = 'https://chronologie-manual-book.vercel.app/d/';

// Initialize directories
[PUBLIC_DOCS_DIR, OUTPUTS_QR_VIEW_DIR, OUTPUTS_QR_DOWNLOAD_DIR, path.dirname(MAPPING_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

async function processManuals() {
    console.log('Starting manual processing...');
    
    // Read source PDFs
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.pdf'));
    if (files.length === 0) {
        console.log('No PDF files found in', SOURCE_DIR);
        return;
    }

    let mapping = {};
    if (fs.existsSync(MAPPING_FILE)) {
        try {
            mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
        } catch(e) {
            console.log('No valid existing mapping found, starting fresh.');
        }
    }

    // Create a set of existing titles to avoid regenerating them
    const existingTitles = new Set(Object.values(mapping).map(item => item.title));
    let addedCount = 0;

    for (const file of files) {
        const title = file.replace('.pdf', '').trim();
        
        let slug = null;

        // Skip if already processed, but we still want to re-generate the QR codes with the new Domain!
        if (existingTitles.has(title)) {
            // Find the existing slug
            slug = Object.keys(mapping).find(key => mapping[key].title === title);
            console.log(`Re-generating QR for existing item "${title}" (slug: ${slug})`);
        } else {
            slug = nanoid(8).toLowerCase();
            const originalPath = path.join(SOURCE_DIR, file);
            const newFileName = `${slug}.txt`; // Disguised as .txt
            const destPath = path.join(PUBLIC_DOCS_DIR, newFileName);
            
            // Copy file
            console.log(`Copying ${file} -> ${newFileName}`);
            fs.copyFileSync(originalPath, destPath);

            // Add to mapping
            mapping[slug] = {
                file: newFileName,
                title: title
            };
            addedCount++;
        }

        // Generate QR Code for View Mode
        const urlView = `${BASE_URL_VIEW}${slug}`;
        const qrView = new QRCodeCanvas({
            width: 1000, height: 1000, data: urlView, margin: 10,
            qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
            imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: 'anonymous' },
            dotsOptions: { color: '#000000', type: 'rounded' }, backgroundOptions: { color: '#ffffff' },
            cornersSquareOptions: { color: '#000000', type: 'extra-rounded' }, cornersDotOptions: { color: '#000000', type: 'dot' }
        });
        await qrView.toFile(path.join(OUTPUTS_QR_VIEW_DIR, `${slug}.png`), 'png');
        await qrView.toFile(path.join(OUTPUTS_QR_VIEW_DIR, `${slug}.svg`), 'svg');

        // Generate QR Code for Download Mode
        const urlDownload = `${BASE_URL_DOWNLOAD}${slug}`;
        const qrDownload = new QRCodeCanvas({
            width: 1000, height: 1000, data: urlDownload, margin: 10,
            qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
            imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: 'anonymous' },
            dotsOptions: { color: '#000000', type: 'rounded' }, backgroundOptions: { color: '#ffffff' },
            cornersSquareOptions: { color: '#000000', type: 'extra-rounded' }, cornersDotOptions: { color: '#000000', type: 'dot' }
        });
        await qrDownload.toFile(path.join(OUTPUTS_QR_DOWNLOAD_DIR, `${slug}.png`), 'png');
        await qrDownload.toFile(path.join(OUTPUTS_QR_DOWNLOAD_DIR, `${slug}.svg`), 'svg');
    }

    if (addedCount > 0) {
        fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
        console.log(`Successfully added ${addedCount} new files!`);
    } else {
        console.log('No new files were added. QR codes regenerated for all existing files.');
    }
}

processManuals().catch(console.error);

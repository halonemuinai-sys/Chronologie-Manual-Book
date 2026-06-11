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
const OUTPUTS_QR_DIR = path.join(ROOT_DIR, 'outputs', 'qr');
const MAPPING_FILE = path.join(ROOT_DIR, 'src', 'config', 'mapping.json');
const BASE_URL = 'https://manuals.raymondweil.com/m/';

// Initialize directories
[PUBLIC_DOCS_DIR, OUTPUTS_QR_DIR, path.dirname(MAPPING_FILE)].forEach(dir => {
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

    const mapping = {};

    for (const file of files) {
        const slug = nanoid(8).toLowerCase();
        const originalPath = path.join(SOURCE_DIR, file);
        const newFileName = `${slug}.txt`;
        const destPath = path.join(PUBLIC_DOCS_DIR, newFileName);
        
        const title = file.replace('.pdf', '').trim();

        // Copy file
        console.log(`Copying ${file} -> ${newFileName}`);
        fs.copyFileSync(originalPath, destPath);

        // Add to mapping
        mapping[slug] = {
            file: newFileName,
            title: title
        };

        // Generate QR Code
        const url = `${BASE_URL}${slug}`;
        console.log(`Generating QR for ${slug} (${url})`);
        
        const qr = new QRCodeCanvas({
            width: 1000,
            height: 1000,
            data: url,
            margin: 10,
            qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
            imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: 'anonymous' },
            dotsOptions: { color: '#000000', type: 'rounded' },
            backgroundOptions: { color: '#ffffff' },
            cornersSquareOptions: { color: '#000000', type: 'extra-rounded' },
            cornersDotOptions: { color: '#000000', type: 'dot' }
        });

        await qr.toFile(path.join(OUTPUTS_QR_DIR, `${slug}.png`), 'png');
        await qr.toFile(path.join(OUTPUTS_QR_DIR, `${slug}.svg`), 'svg');
    }

    // Write mapping
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Generated mapping for ${files.length} files at ${MAPPING_FILE}`);
    console.log('Done!');
}

processManuals().catch(console.error);

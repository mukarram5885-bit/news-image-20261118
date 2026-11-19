import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_FILE_SIZE = 1_048_576;
const IHDR_LENGTH = 13;

const source = new URL('./entry.png', import.meta.url);
const image = readFileSync(source);

if (image.length >= MAX_FILE_SIZE) {
  throw new Error(`entry.png must be smaller than ${MAX_FILE_SIZE} bytes.`);
}

if (image.length < 33) {
  throw new Error('entry.png is too short to contain a PNG IHDR chunk.');
}

if (!image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png does not have the PNG signature.');
}

const ihdrLength = image.readUInt32BE(8);
const ihdrType = image.subarray(12, 16).toString('ascii');

if (ihdrLength !== IHDR_LENGTH || ihdrType !== 'IHDR') {
  throw new Error('entry.png does not begin with a valid IHDR chunk.');
}

const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);

if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024 pixels, received ${width}x${height}.`);
}

const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destination = join(outputDirectory, 'entry.png');

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(destination, image);

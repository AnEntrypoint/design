#!/usr/bin/env node
import zlib from 'node:zlib';

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SIGNATURE_BYTES = 8;
const CHUNK_CRC_BYTES = 4;
const COLOR_TYPE_RGB = 2;
const COLOR_TYPE_RGBA = 6;

function readChunks(buf) {
    const header = {};
    const idat = [];
    let off = SIGNATURE_BYTES;
    while (off < buf.length) {
        const len = buf.readUInt32BE(off);
        const type = buf.toString('ascii', off + 4, off + 8);
        const dataStart = off + 8;
        if (type === 'IHDR') {
            header.width = buf.readUInt32BE(dataStart);
            header.height = buf.readUInt32BE(dataStart + 4);
            header.bitDepth = buf[dataStart + 8];
            header.colorType = buf[dataStart + 9];
            header.interlace = buf[dataStart + 12];
        } else if (type === 'IDAT') {
            idat.push(buf.subarray(dataStart, dataStart + len));
        } else if (type === 'IEND') {
            break;
        }
        off = dataStart + len + CHUNK_CRC_BYTES;
    }
    return { header, idat };
}

function paethPredictor(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
}

function unfilterScanlines(raw, { width, height, channels }) {
    const stride = width * channels;
    const out = Buffer.alloc(height * stride);
    let pos = 0;
    for (let y = 0; y < height; y++) {
        const filter = raw[pos++];
        const rowStart = y * stride;
        const prevStart = rowStart - stride;
        for (let x = 0; x < stride; x++) {
            const cur = raw[pos + x];
            const left = x >= channels ? out[rowStart + x - channels] : 0;
            const above = y > 0 ? out[prevStart + x] : 0;
            const upperLeft = (x >= channels && y > 0) ? out[prevStart + x - channels] : 0;
            let val;
            switch (filter) {
                case 0: val = cur; break;
                case 1: val = cur + left; break;
                case 2: val = cur + above; break;
                case 3: val = cur + ((left + above) >> 1); break;
                case 4: val = cur + paethPredictor(left, above, upperLeft); break;
                default: throw new Error(`unknown PNG filter type ${filter} on row ${y}`);
            }
            out[rowStart + x] = val & 0xff;
        }
        pos += stride;
    }
    return out;
}

export function decodePng(buf) {
    if (!buf.subarray(0, SIGNATURE_BYTES).equals(PNG_SIG)) throw new Error('not a PNG (bad signature)');

    const { header, idat } = readChunks(buf);
    const { width, height, bitDepth, colorType, interlace } = header;

    if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth} (need 8)`);
    if (colorType !== COLOR_TYPE_RGB && colorType !== COLOR_TYPE_RGBA) throw new Error(`unsupported PNG colour type ${colorType} (need 2 or 6)`);
    if (interlace !== 0) throw new Error('unsupported interlaced PNG');

    const channels = colorType === COLOR_TYPE_RGBA ? 4 : 3;
    const raw = zlib.inflateSync(Buffer.concat(idat));
    return { width, height, channels, data: unfilterScanlines(raw, { width, height, channels }) };
}

export function diffImages(a, b, { channelTolerance = 24 } = {}) {
    if (a.width !== b.width || a.height !== b.height) {
        return {
            sizeMismatch: true, diffCount: a.width * a.height, totalPixels: a.width * a.height, diffRatio: 1,
            detail: `${a.width}x${a.height} vs ${b.width}x${b.height}`,
        };
    }
    const total = a.width * a.height;
    let diffCount = 0;
    let maxDelta = 0;
    for (let i = 0; i < total; i++) {
        const ai = i * a.channels;
        const bi = i * b.channels;
        const dr = Math.abs(a.data[ai] - b.data[bi]);
        const dg = Math.abs(a.data[ai + 1] - b.data[bi + 1]);
        const db = Math.abs(a.data[ai + 2] - b.data[bi + 2]);
        const d = Math.max(dr, dg, db);
        if (d > maxDelta) maxDelta = d;
        if (d > channelTolerance) diffCount++;
    }
    return { sizeMismatch: false, diffCount, totalPixels: total, diffRatio: diffCount / total, maxDelta };
}

export function diffPngBuffers(bufA, bufB, opts) {
    return diffImages(decodePng(bufA), decodePng(bufB), opts);
}

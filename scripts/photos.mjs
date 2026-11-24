/**
 * Run `node scripts/photos.mjs` or `npm run photos` from the repository.
 * Put originals in photos/<set-dir>/; each directory is one gallery set.
 * Supported: jpg, jpeg, png, webp, tif, tiff, heic, heif, avif (any case).
 * Dotfiles and other files are ignored. Originals are never modified.
 * Optional photos/<set-dir>/set.json:
 * { "title": "Streets", "order": 1, "sample": true,
 *   "photos": { "my-photo": { "title": "Evening", "date": "2024-03-12",
 *     "location": "Accra", "credit": "Name", "source": "https://example.com",
 *     "camera": "Camera name", "lens": "Lens name", "focal": "17mm",
 *     "aperture": "f/2.8", "shutter": "1/777s", "iso": 20 } } }
 * Photo keys can include the original extension. All fields are optional.
 * Writes WebP variants to public/photos/ and lib/site/cache/photos.json.
 * photos.lock.json keeps source signatures and reusable metadata separate.
 * Default: reuse unchanged photos; retain deleted originals with all variants.
 * --force re-encodes originals; --prune drops deleted originals and stray variants.
 * HEIC/HEIF decoding falls back to macOS sips using a temporary JPEG.
 */

import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import exifr from 'exifr';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ORIGINALS = path.join(ROOT, 'photos');
const OUTPUT = path.join(ROOT, 'public/photos');
const MANIFEST = path.join(ROOT, 'lib/site/cache/photos.json');
const LOCK = path.join(ROOT, 'lib/site/cache/photos.lock.json');
const WIDTHS = [480, 960, 1600, 2400];
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.avif']);
const EXIF_KEYS = ['camera', 'lens', 'focal', 'aperture', 'shutter', 'iso'];
const CACHE_VERSION = 1;
const run = promisify(execFile);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;
const variantPath = (id, width) => path.join(OUTPUT, `${id}-${width}.webp`);
/* The standard widths that fit, plus the original's own width when it sits well above the largest of them:
   a 1448px original used to stop at 960, which threw away a third of its detail and looked soft when zoomed. */
const variantWidths = width => {
    const fit = WIDTHS.filter(value => value <= width);
    if (!fit.length) return [width];
    return width >= fit[fit.length - 1] * 1.08 && width < WIDTHS[WIDTHS.length - 1] ? [...fit, width] : fit;
};
const slug = name => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const titleCase = name => name.replace(/-/g, ' ').replace(/\b\w/g, value => value.toUpperCase());

async function readJson(file, fallback) {
    try {
        return JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return fallback;
        throw new Error(`Cannot read ${path.relative(ROOT, file)}: ${error.message}`);
    }
}

async function fileStat(file) {
    try {
        const result = await stat(file);
        return result.isFile() ? result : null;
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

async function writeJson(file, value) {
    const data = `${JSON.stringify(value, null, 2)}\n`;
    try {
        if (await readFile(file, 'utf8') === data) return;
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    const temporary = `${file}.${process.pid}.tmp`;
    try {
        await writeFile(temporary, data);
        await rename(temporary, file);
    } finally {
        await rm(temporary, { force: true });
    }
}

async function discover() {
    const sets = new Map();
    const originals = [];
    const ids = new Map();
    let directories;
    try {
        directories = await readdir(ORIGINALS, { withFileTypes: true });
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        directories = [];
    }
    for (const directory of directories.sort((a, b) => compare(a.name, b.name))) {
        if (!directory.isDirectory() || directory.name.startsWith('.')) continue;
        const folder = path.join(ORIGINALS, directory.name);
        const setId = slug(directory.name);
        if (!setId) throw new Error(`Set directory has no usable slug: ${directory.name}`);
        if (sets.has(setId)) throw new Error(`Set directories map to the same id: ${setId}`);
        const sidecar = await readJson(path.join(folder, 'set.json'), {});
        if (!sidecar || typeof sidecar !== 'object' || Array.isArray(sidecar)) {
            throw new Error(`Expected an object in photos/${directory.name}/set.json`);
        }
        const set = {
            id: setId,
            title: text(sidecar.title) ?? titleCase(directory.name),
            order: Number.isFinite(sidecar.order) ? sidecar.order : Infinity,
            sample: sidecar.sample === true,
        };
        sets.set(setId, set);
        const files = await readdir(folder, { withFileTypes: true });
        for (const file of files.sort((a, b) => compare(a.name, b.name))) {
            const extension = path.extname(file.name);
            if (!file.isFile() || file.name.startsWith('.') || !EXTENSIONS.has(extension.toLowerCase())) continue;
            const stem = file.name.slice(0, -extension.length);
            const photoId = slug(stem);
            if (!photoId) throw new Error(`Photo has no usable slug: photos/${directory.name}/${file.name}`);
            const id = `${setId}-${photoId}`;
            const input = path.join(folder, file.name);
            if (ids.has(id)) {
                throw new Error(`Two originals map to id "${id}": ${ids.get(id)} and ${path.relative(ROOT, input)}`);
            }
            ids.set(id, path.relative(ROOT, input));
            const metadata = sidecar.photos?.[stem] ?? sidecar.photos?.[file.name] ?? {};
            originals.push({ id, input, set, sidecar: metadata, signature: await stat(input) });
        }
    }
    return { sets, originals };
}

function datePart(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value !== 'string') return null;
    const match = /^(\d{4})[:-](\d{2})[:-](\d{2})(?:$|[T\s])/.exec(value.trim());
    if (!match) return null;
    const date = `${match[1]}-${match[2]}-${match[3]}`;
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(date) ? date : null;
}

function selectExif(value) {
    const result = {};
    for (const key of EXIF_KEYS) {
        if (key === 'iso' ? Number.isFinite(value?.[key]) : text(value?.[key])) result[key] = value[key];
    }
    return Object.keys(result).length ? result : null;
}

async function readExif(input) {
    let tags;
    // Explicit allowlist; GPS blocks and coordinate derivation are disabled.
    const parse = async file => await exifr.parse(file, {
        gps: false,
        reviveValues: false,
        translateValues: false,
        pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'DateTimeOriginal'],
    }) ?? {};
    try {
        tags = await parse(input);
    } catch (error) {
        tags = {};
        // exifr cannot read every HEIC container; sips copies the EXIF block into a JPEG it can read.
        const heic = ['.heic', '.heif'].includes(path.extname(input).toLowerCase());
        let temporary;
        try {
            if (!heic || process.platform !== 'darwin') throw error;
            temporary = await mkdtemp(path.join(os.tmpdir(), 'photos-exif-'));
            const converted = path.join(temporary, 'converted.jpg');
            await run('sips', ['-s', 'format', 'jpeg', '-Z', '64', input, '--out', converted]);
            tags = await parse(converted);
        } catch (fallbackError) {
            console.warn(`EXIF unavailable for ${path.relative(ROOT, input)}: ${fallbackError.message}`);
        } finally {
            if (temporary) await rm(temporary, { recursive: true, force: true });
        }
    }
    const make = text(tags.Make);
    const model = text(tags.Model);
    const camera = make && model && !model.toLowerCase().includes(make.toLowerCase())
        ? `${make} ${model}` : model ?? make;
    const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
    const number = value => Number(value.toFixed(4));
    return {
        date: datePart(tags.DateTimeOriginal),
        exif: selectExif({
            camera,
            lens: text(tags.LensModel),
            focal: positive(tags.FocalLength) ? `${Math.round(tags.FocalLength)}mm` : null,
            aperture: positive(tags.FNumber) ? `f/${Number(tags.FNumber.toFixed(2))}` : null,
            shutter: positive(tags.ExposureTime)
                ? tags.ExposureTime < 1 ? `1/${Math.round(1 / tags.ExposureTime)}s` : `${number(tags.ExposureTime)}s`
                : null,
            iso: positive(tags.ISO) ? tags.ISO : null,
        }),
    };
}

function rgbToHsl(rgb) {
    const [r, g, b] = rgb.map(value => value / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min, lightness = (max + min) / 2;
    let hue = 0;
    if (delta) {
        if (max === r) hue = ((g - b) / delta) % 6;
        else if (max === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
        hue = (hue * 60 + 360) % 360;
    }
    return [hue, delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0, lightness];
}

const hex = rgb => `#${rgb.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
const distance = (a, b) => a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0);

function extractPalette(data) {
    const histogram = new Map();
    for (let offset = 0; offset < data.length; offset += 3) {
        const rgb = [data[offset], data[offset + 1], data[offset + 2]];
        const key = rgb.join(',');
        if (histogram.has(key)) histogram.get(key).count++;
        else histogram.set(key, { rgb, count: 1 });
    }
    const points = [...histogram.values()];
    // Fixed, farthest-point initialization: most frequent pixel, then farthest pixels.
    const first = points.reduce((best, point) => point.count > best.count ? point : best);
    let centers = [first.rgb];
    while (centers.length < 5) {
        let best = points[0], bestDistance = -1;
        for (const point of points) {
            const nearest = Math.min(...centers.map(center => distance(point.rgb, center)));
            if (nearest > bestDistance) { best = point; bestDistance = nearest; }
        }
        if (bestDistance === 0) break;
        centers.push(best.rgb);
    }
    const assign = () => {
        const clusters = centers.map(rgb => ({ rgb, sum: [0, 0, 0], count: 0 }));
        for (const point of points) {
            let nearest = 0;
            for (let index = 1; index < centers.length; index++) {
                if (distance(point.rgb, centers[index]) < distance(point.rgb, centers[nearest])) nearest = index;
            }
            const cluster = clusters[nearest];
            cluster.count += point.count;
            for (let channel = 0; channel < 3; channel++) cluster.sum[channel] += point.rgb[channel] * point.count;
        }
        return clusters;
    };
    for (let iteration = 0; iteration < 10; iteration++) {
        centers = assign().map(cluster => cluster.count
            ? cluster.sum.map(value => value / cluster.count) : cluster.rgb);
    }
    const clusters = assign().filter(cluster => cluster.count).sort((a, b) => b.count - a.count);
    const dominant = clusters[0].rgb.map(Math.round);
    const colors = new Map(clusters.map(cluster => {
        const rgb = cluster.rgb.map(Math.round);
        return [hex(rgb), rgb];
    }));
    // Flat or nearly monochrome images still get five distinct swatches.
    for (let step = 1; colors.size < 5; step++) {
        for (const sign of [-1, 1]) {
            const rgb = dominant.map(value => Math.max(0, Math.min(255, value + sign * step * 16)));
            colors.set(hex(rgb), rgb);
            if (colors.size === 5) break;
        }
    }
    const brightness = rgb => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const palette = [...colors.values()].sort((a, b) => brightness(a) - brightness(b) || compare(hex(a), hex(b)));
    const vivid = palette.map(rgbToHsl).filter(hsl => hsl[2] >= 0.15 && hsl[2] <= 0.85)
        .sort((a, b) => b[1] - a[1])[0] ?? rgbToHsl(dominant);
    return {
        color: hex(dominant),
        palette: palette.map(hex),
        hsl: [Math.round(vivid[0]), Number(vivid[1].toFixed(2)), Number(vivid[2].toFixed(2))],
    };
}

async function openImage(input) {
    let temporary;
    const decode = async file => {
        const image = sharp(file).rotate().toColourspace('srgb');
        const metadata = await image.metadata();
        // Decode pixels now: HEIC metadata alone can succeed without an HEVC decoder.
        const pixels = await image.clone().resize(48, 48, { fit: 'inside', withoutEnlargement: true })
            .removeAlpha().raw().toBuffer();
        return { image, pixels, w: metadata.autoOrient.width, h: metadata.autoOrient.height };
    };
    try {
        let decoded;
        try {
            decoded = await decode(input);
        } catch (error) {
            if (!['.heic', '.heif'].includes(path.extname(input).toLowerCase())) throw error;
            if (process.platform !== 'darwin') throw new Error(`Sharp cannot decode HEIC/HEIF; sips fallback requires macOS: ${error.message}`);
            temporary = await mkdtemp(path.join(os.tmpdir(), 'photos-'));
            const converted = path.join(temporary, 'converted.jpg');
            try {
                await run('sips', ['-s', 'format', 'jpeg', input, '--out', converted]);
                decoded = await decode(converted);
            } catch (fallbackError) {
                throw new Error(`Sharp decoding failed (${error.message}); sips fallback failed (${fallbackError.message})`);
            }
            console.warn(`HEIC/HEIF sips fallback: ${path.relative(ROOT, input)}`);
        }
        return { ...decoded, cleanup: () => temporary ? rm(temporary, { recursive: true, force: true }) : Promise.resolve() };
    } catch (error) {
        if (temporary) await rm(temporary, { recursive: true, force: true });
        throw error;
    }
}

function makeEntry(original, imageData, metadata) {
    const sidecar = original.sidecar;
    const exif = selectExif({ ...metadata.exif,
        camera: text(sidecar.camera) ?? metadata.exif?.camera,
        lens: text(sidecar.lens) ?? metadata.exif?.lens,
        focal: text(sidecar.focal) ?? metadata.exif?.focal,
        aperture: text(sidecar.aperture) ?? metadata.exif?.aperture,
        shutter: text(sidecar.shutter) ?? metadata.exif?.shutter,
        iso: Number.isFinite(sidecar.iso) ? sidecar.iso : metadata.exif?.iso });
    const date = text(sidecar.date);
    if (date && !datePart(date)) throw new Error(`Invalid sidecar date for ${original.id}: ${date}`);
    return {
        id: original.id,
        set: original.set.id,
        w: imageData.w,
        h: imageData.h,
        widths: imageData.widths,
        color: imageData.color,
        palette: imageData.palette,
        hsl: imageData.hsl,
        lqip: imageData.lqip,
        date: date ? datePart(date) : metadata.date,
        title: text(sidecar.title),
        location: text(sidecar.location),
        credit: text(sidecar.credit),
        source: text(sidecar.source),
        exif,
        ...(original.set.sample ? { sample: true } : {}),
    };
}

async function processPhoto(original, previous, cached, force) {
    const { id, input, signature } = original;
    const unchanged = !force && previous && cached?.version === CACHE_VERSION
        && cached.mtimeMs === signature.mtimeMs && cached.size === signature.size;
    let opened;
    try {
        let imageData = unchanged ? previous : null;
        const metadata = unchanged ? { exif: cached.exif, date: cached.date } : await readExif(input);
        if (!imageData) {
            opened = await openImage(input);
            const lqip = await opened.image.clone().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
            imageData = {
                w: opened.w, h: opened.h, widths: variantWidths(opened.w),
                ...extractPalette(opened.pixels),
                lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
            };
        }
        let encoded = false;
        for (const width of imageData.widths) {
            const destination = variantPath(id, width);
            const existing = await fileStat(destination);
            if (!force && existing && (unchanged || existing.mtimeMs > signature.mtimeMs)) continue;
            opened ??= await openImage(input);
            const temporary = path.join(OUTPUT, `.${id}-${width}.${process.pid}.webp`);
            try {
                const quality = width >= 2400 ? 78 : width >= 1600 ? 80 : 82;
                const result = await opened.image.clone().resize({ width, withoutEnlargement: true })
                    .webp({ quality }).toFile(temporary);
                if (result.width !== width) throw new Error(`Expected width ${width}, received ${result.width}`);
                await rename(temporary, destination);
            } finally {
                await rm(temporary, { force: true });
            }
            encoded = true;
        }
        return {
            entry: makeEntry(original, imageData, metadata),
            lock: { version: CACHE_VERSION, mtimeMs: signature.mtimeMs, size: signature.size,
                date: metadata.date, exif: metadata.exif },
            line: unchanged && !encoded ? `= ${id}` : `+ ${id}  ${imageData.w}x${imageData.h}  [${imageData.widths.join(', ')}]`,
        };
    } catch (error) {
        throw new Error(`${path.relative(ROOT, input)}: ${error.message}`);
    } finally {
        await opened?.cleanup();
    }
}

async function mapLimit(items, callback) {
    const results = new Array(items.length);
    let next = 0, failure;
    await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
        while (!failure && next < items.length) {
            const index = next++;
            try { results[index] = await callback(items[index]); }
            catch (error) { failure ??= error; }
        }
    }));
    if (failure) throw failure;
    return results;
}

async function totalBytes(directory) {
    let bytes = 0;
    for (const file of await readdir(directory, { withFileTypes: true })) {
        const target = path.join(directory, file.name);
        if (file.isDirectory()) bytes += await totalBytes(target);
        else if (file.isFile()) bytes += (await stat(target)).size;
    }
    return bytes;
}

async function main() {
    const flags = new Set(process.argv.slice(2));
    for (const flag of flags) {
        if (!['--prune', '--force'].includes(flag)) throw new Error(`Unknown option: ${flag}. Usage: node scripts/photos.mjs [--force] [--prune]`);
    }
    // Detect collisions before writing any output.
    const { sets, originals } = await discover();
    const previous = await readJson(MANIFEST, { sets: [], photos: [] });
    const cache = await readJson(LOCK, {});
    const previousById = new Map(previous.photos.map(photo => [photo.id, photo]));
    await mkdir(OUTPUT, { recursive: true });
    await mkdir(path.dirname(MANIFEST), { recursive: true });
    const processed = await mapLimit(originals, original =>
        processPhoto(original, previousById.get(original.id), cache[original.id], flags.has('--force')));
    const photos = processed.map(result => result.entry);
    const locks = new Map(processed.map(result => [result.entry.id, result.lock]));
    const present = new Set(photos.map(photo => photo.id));
    if (!flags.has('--prune')) {
        for (const photo of previous.photos) {
            if (present.has(photo.id)) continue;
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.id)
                || !photo.widths?.length || !photo.widths.every(width => Number.isInteger(width) && width > 0)) {
                throw new Error(`Invalid cached photo: ${photo.id}`);
            }
            const variants = await Promise.all(photo.widths.map(width => fileStat(variantPath(photo.id, width))));
            if (!variants.every(Boolean)) continue;
            photos.push(photo);
            if (cache[photo.id]) locks.set(photo.id, cache[photo.id]);
            processed.push({ line: `= ${photo.id}` });
        }
    }
    photos.sort((a, b) => a.date === b.date ? compare(a.id, b.id)
        : a.date === null ? 1 : b.date === null ? -1 : compare(b.date, a.date));
    const counts = new Map();
    for (const photo of photos) counts.set(photo.set, (counts.get(photo.set) ?? 0) + 1);
    const previousSets = new Map(previous.sets.map(set => [set.id, set]));
    const orderedSets = [...counts].map(([id, count]) => {
        const set = sets.get(id) ?? { id, title: previousSets.get(id)?.title ?? titleCase(id), order: Infinity };
        return { ...set, count };
    }).sort((a, b) => (a.order === b.order ? 0 : a.order < b.order ? -1 : 1)
        || compare(a.title, b.title) || compare(a.id, b.id));
    const manifest = { widths: WIDTHS, sets: orderedSets.map(({ id, title, count }) => ({ id, title, count })), photos };
    await writeJson(MANIFEST, manifest);
    await writeJson(LOCK, Object.fromEntries([...locks].sort(([a], [b]) => compare(a, b))));
    if (flags.has('--prune')) {
        const wanted = new Set(photos.flatMap(photo => photo.widths.map(width => `${photo.id}-${width}.webp`)));
        for (const file of await readdir(OUTPUT, { withFileTypes: true })) {
            if (file.isFile() && /^[a-z0-9-]+-\d+\.webp$/.test(file.name) && !wanted.has(file.name)) {
                await rm(path.join(OUTPUT, file.name));
            }
        }
    }
    for (const result of processed) console.log(result.line);
    console.log(`${photos.length} photos, ${manifest.sets.length} sets, ${await totalBytes(OUTPUT)} bytes in public/photos`);
}

main().catch(error => {
    console.error(`photos: ${error.message}`);
    process.exitCode = 1;
});

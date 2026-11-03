// Optional local source; originals stay outside the repository. The WebP output is committed.
const sharp=require('sharp');
if(!process.argv[2])throw Error('Pass the approved Content Board image path');
sharp(process.argv[2]).resize({width:800,withoutEnlargement:true}).webp({quality:84}).toFile('public/news/solar-panel-battery-price-decline-2026.webp');

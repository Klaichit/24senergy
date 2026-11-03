import {writeFile,readdir} from 'node:fs/promises'
import sharp from 'sharp'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const config={content:['./public/index.html','./public/products.html','./public/solutions.html','./public/home.js'],theme:{extend:{colors:{brand:{DEFAULT:'#6A2DAF',600:'#7a3cc4',500:'#8b4dd6',light:'#f1e9fb',tint:'#faf7fd'},ink:{DEFAULT:'#1a1a1a',soft:'#4a4a4a',mute:'#8a8a8a'}},fontFamily:{sans:['Noto Sans Thai','Noto Sans','sans-serif'],display:['Noto Sans Thai','Space Grotesk','sans-serif']},boxShadow:{soft:'0 10px 40px -12px rgba(106,45,175,.20)',card:'0 8px 30px -12px rgba(26,26,46,.14)'}}},plugins:[require('@tailwindcss/forms')]}
// Tailwind 3 matches the existing storefront markup; Next's own Tailwind 4 is separate.
const postcss=createRequire(require.resolve('tailwindcss-public/package.json'))('postcss')
const tailwind=require('tailwindcss-public')
const result=await postcss([tailwind(config)]).process('@tailwind base;@tailwind components;@tailwind utilities;',{from:undefined})
await writeFile('public/store-utilities.css',result.css)
for(const name of await readdir('public')){
 if(!/^(v2-.*|products-header|contact-banner)\.png$/.test(name))continue
 await sharp(`public/${name}`).resize({width:1600,withoutEnlargement:true}).webp({quality:80}).toFile(`public/${name.replace('.png','.webp')}`)
}
for(const name of await readdir('public/catalog')){
 if(!name.endsWith('.png'))continue
 await sharp(`public/catalog/${name}`).resize({width:800,withoutEnlargement:true}).webp({quality:82}).toFile(`public/catalog/${name.replace('.png','.webp')}`)
}
const news=await readdir('public/news')
await writeFile('public/news-images.css','/* Generated: only reference article images that actually exist. */\n'+news.filter(n=>/^[a-z0-9][a-z0-9.-]*\.webp$/.test(n)).map(n=>`[data-slug="${n.slice(0,-5)}"]{--news-img:url('news/${n}');}`).join('\n'))
console.log('Built storefront CSS, WebP derivatives and available news image manifest.')

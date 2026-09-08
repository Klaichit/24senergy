import { readdir, readFile, writeFile } from 'node:fs/promises'
const check = process.argv.includes('--check')
let mismatch = false
for (const name of (await readdir('public')).filter(name => name.endsWith('.html'))) {
  const content = await readFile(`public/${name}`, 'utf8')
  if (check) {
    if (await readFile(name, 'utf8').catch(() => '') !== content) { console.error(`Outdated mirror: ${name}`); mismatch = true }
  } else await writeFile(name, content)
}
if (mismatch) process.exitCode = 1

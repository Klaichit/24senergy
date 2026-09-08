import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import vm from 'node:vm'

test('all inline browser scripts parse', () => {
  for (const file of readdirSync('public').filter(f => f.endsWith('.html'))) {
    const html=readFileSync(`public/${file}`,'utf8')
    for (const match of html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1],{filename:file})
  }
})
test('homepage has one matching H1 and shared form handlers do not simulate success', () => {
  const html=readFileSync('public/index.html','utf8')
  assert.equal((html.match(/<h1\b/g)||[]).length,1)
  assert.equal((html.match(/<\/h1>/g)||[]).length,1)
  for(const file of ['quote','contact','news']) {
    const page=readFileSync(`public/${file}.html`,'utf8')
    assert.ok(page.includes('/site.js'))
    assert.ok(!page.includes('onsubmit='))
    assert.ok(!page.includes("addEventListener('submit'"))
  }
})
test('CMS escaping and URL validation reject active content', () => {
  const sandbox={window:{},location:{origin:'https://example.com'},URL,document:{addEventListener(){}}}
  vm.runInNewContext(readFileSync('public/site.js','utf8'),sandbox)
  assert.equal(sandbox.window.safeURL('javascript:alert(1)'),'')
  assert.equal(sandbox.window.safeURL('data:text/html,test'),'')
  assert.equal(sandbox.window.safeURL('/01.webp'),'https://example.com/01.webp')
  assert.equal(sandbox.window.escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;')
})

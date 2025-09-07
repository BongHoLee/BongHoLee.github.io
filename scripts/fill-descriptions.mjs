import fs from 'fs/promises';
import path from 'path';

const BLOG_DIR = path.join('src', 'content', 'blog');

const PLACEHOLDER_SET = new Set([
  '',
  '이 포스트에 대한 설명',
  '<br>',
  '<br/>',
  '<br />',
  '-',
]);

function parseFrontmatter(src) {
  const m = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  const fmText = m[1];
  const start = m.index;
  const end = start + m[0].length;

  const out = {
    raw: fmText,
    start,
    end,
    title: undefined,
    description: undefined,
  };

  const titleMatch = fmText.match(/^title:\s*(.*)$/m);
  if (titleMatch) out.title = titleMatch[1].trim().replace(/^"|^'|"$|'$/g, '');

  const descMatch = fmText.match(/^description:\s*(.*)$/m);
  if (descMatch) out.description = descMatch[1].trim().replace(/^"|^'|"$|'$/g, '');

  return out;
}

function stripMarkdownAndHtml(text) {
  let s = text;
  // remove code fences
  s = s.replace(/```[\s\S]*?```/g, ' ');
  // remove inline code
  s = s.replace(/`[^`]*`/g, ' ');
  // remove HTML/script tags
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  // remove markdown headings and emphasis
  s = s.replace(/^#{1,6}\s+/gm, '');
  s = s.replace(/[\*_]{1,3}([^\*_]+)[\*_]{1,3}/g, '$1');
  // remove images/links syntax but keep text
  s = s.replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ');
  s = s.replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1');
  // collapse list markers
  s = s.replace(/^\s*[-*+]\s+/gm, '');
  s = s.replace(/^\s*\d+\.\s+/gm, '');
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function summarize(text, maxLen = 160, minLen = 80) {
  if (!text) return '';
  // split by sentence-ending punctuation common in ko/en
  const parts = text.split(/(?<=[\.\!\?]|다\.|요\.|니다\.|됨\.|함\.|됨\?|함\?)\s+/);
  let out = '';
  for (const p of parts) {
    if (!p) continue;
    const next = out ? `${out} ${p}` : p;
    if (next.length <= maxLen) {
      out = next;
      if (out.length >= minLen) break;
    } else {
      if (out.length < minLen) {
        out = next.slice(0, maxLen);
      }
      break;
    }
  }
  if (!out) out = text.slice(0, maxLen);
  return out.trim();
}

function needsDescription(desc) {
  if (desc == null) return true;
  const cleaned = desc.replace(/^"|^'|"$|'$/g, '').trim();
  if (PLACEHOLDER_SET.has(cleaned)) return true;
  // too short or obviously markup-only
  if (cleaned.length < 10) return true;
  return false;
}

function quote(str) {
  // prefer double quotes; escape internal quotes
  return '"' + str.replace(/"/g, '\\"') + '"';
}

async function processFile(filePath) {
  const src = await fs.readFile(filePath, 'utf8');
  const fm = parseFrontmatter(src);
  if (!fm) return null;

  if (!needsDescription(fm.description)) return null;

  const content = src.slice(fm.end);
  const cleaned = stripMarkdownAndHtml(content);
  const summary = summarize(cleaned);

  if (!summary) return null;

  let newFmText;
  if (/^description:\s*.*$/m.test(fm.raw)) {
    newFmText = fm.raw.replace(/^description:\s*.*$/m, `description: ${quote(summary)}`);
  } else {
    // Insert description after title if exists; otherwise at top
    if (/^title:\s*.*$/m.test(fm.raw)) {
      newFmText = fm.raw.replace(/^(title:.*)$/m, `$1\ndescription: ${quote(summary)}`);
    } else {
      newFmText = `description: ${quote(summary)}\n` + fm.raw;
    }
  }

  const updated = src.slice(0, fm.start) + `---\n${newFmText}\n---\n` + src.slice(fm.end);
  if (updated !== src) {
    await fs.writeFile(filePath, updated, 'utf8');
    return { filePath, description: summary.slice(0, 80) + (summary.length > 80 ? '…' : '') };
  }
  return null;
}

async function main() {
  const entries = await fs.readdir(BLOG_DIR);
  const mdFiles = entries.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const results = [];
  for (const f of mdFiles) {
    const fp = path.join(BLOG_DIR, f);
    try {
      const res = await processFile(fp);
      if (res) results.push(res);
    } catch (e) {
      console.error('Failed', fp, e.message);
    }
  }
  console.log(`Descriptions updated in ${results.length} files.`);
  for (const r of results.slice(0, 20)) {
    console.log('-', r.filePath, '=>', r.description);
  }
  if (results.length > 20) console.log('...');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


import fs from 'fs/promises';
import path from 'path';

const BLOG_DIR = path.join('src', 'content', 'blog');

// Canonical tag normalizations and removals
const DROP_TAGS = new Set([
  'Keywords',
  'Keyword',
  'Basic',
]);

const RENAME_TAGS = new Map([
  ['Object', 'OOP'],
  ['Programmer', 'Programmers'],
  ['Spring_Framework', 'Spring'],
  ['Spring_Boot', 'Spring Boot'],
  ['TroubleShooting', 'Troubleshooting'],
  ['DataBase', 'Database'],
]);

function uniq(arr) {
  return [...new Set(arr)];
}

function parseFrontmatter(src) {
  // Match top frontmatter block only, allow trailing spaces after ---
  const fmMatch = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!fmMatch) return null;
  const fmText = fmMatch[1];
  const start = fmMatch.index;
  const end = start + fmMatch[0].length;

  // Simple line-based parsing for known fields
  const fm = {
    raw: fmText,
    start,
    end,
    title: undefined,
    tags: [],
  };

  // title
  const titleMatch = fmText.match(/^title:\s*(.*)$/m);
  if (titleMatch) {
    fm.title = titleMatch[1].trim().replace(/^"|^'|"$|'$/g, '');
  }

  // tags: ["A", "B"]
  const tagMatch = fmText.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (tagMatch) {
    const raw = tagMatch[1];
    fm.tags = raw
      .split(',')
      .map((s) => s.replace(/[\[\]"]+/g, '').trim())
      .filter(Boolean);
  }

  return fm;
}

function normalizeExistingTags(tags) {
  const out = [];
  for (const t of tags) {
    const renamed = RENAME_TAGS.get(t) ?? t;
    if (!DROP_TAGS.has(renamed)) out.push(renamed);
  }
  return uniq(out);
}

function deriveTags({ title = '', slug = '' }) {
  const ltext = `${title} ${slug}`.toLowerCase();
  const tags = new Set();

  // Languages / runtimes
  if (/(^|\b)java(\b|:)/.test(ltext) || /\bjvm\b/.test(ltext) || /servlet/.test(ltext)) tags.add('Java');
  if (/\bkotlin\b/.test(ltext)) tags.add('Kotlin');
  if (/\bjvm\b/.test(ltext)) tags.add('JVM');

  // Spring ecosystem
  if (/spring(-|\s|$)/.test(ltext)) tags.add('Spring');
  if (/spring[-_]?security/.test(ltext)) tags.add('Spring Security');
  if (/spring\s*boot/.test(ltext)) tags.add('Spring Boot');
  if (/session/.test(ltext)) tags.add('Session');
  if (/cache(?!\.md)/.test(ltext) && !/algo(i|r)thm/.test(ltext)) tags.add('Cache');
  if (/transaction|트랜잭션/.test(ltext)) tags.add('Transaction');

  // Algorithms & DS
  if (/algo(i|r)thm|bellman|shortest[- ]?path/.test(ltext) || categories.includes('Algorithm')) tags.add('Algorithm');
  if (/programmer/.test(ltext) || /programmers/.test(ltext)) tags.add('Programmers');
  if (/graph/.test(ltext)) tags.add('Graph');
  if (/tree/.test(ltext)) tags.add('Tree');
  if (/hashing|hashmap|hashtable|treemap|linkedhashmap/.test(ltext)) tags.add('Hashing');
  if (/recursion/.test(ltext)) tags.add('Recursion');
  if (/http/.test(ltext)) tags.add('HTTP');

  // OOP / Design
  if (/객체|다형성|상속|유연한\s*설계|협력|책임|의존성|서브클래싱|서브타이핑|디자인패턴|프레임워크/.test(ltext)) tags.add('OOP');
  if (/clean\s*code/.test(ltext)) tags.add('Clean Code');
  if (/디자인패턴/.test(ltext)) tags.add('Design Pattern');

  // Build / tooling
  if (/gradle/.test(ltext)) tags.add('Gradle');
  if (/logstash/.test(ltext)) tags.add('Logstash');
  if (/was\b/.test(ltext)) tags.add('DevOps');

  // Meta / insights
  if (/회고록|신년계획|로드맵|loadmap|semina|think/.test(ltext)) tags.add('Insight');

  return [...tags];
}

function stringifyTags(tags) {
  const sorted = [...tags].sort((a, b) => a.localeCompare(b));
  return `tags: [${sorted.map((t) => `"${t}"`).join(', ')}]`;
}

async function processFile(filePath) {
  const src = await fs.readFile(filePath, 'utf8');
  const fm = parseFrontmatter(src);
  if (!fm) return null;

  const slug = path.basename(filePath).replace(/\.mdx?$/, '');
  const existing = normalizeExistingTags(fm.tags || []);
  const derived = deriveTags({ title: fm.title || '', slug });

  // Merge existing (normalized) with derived, then drop known noisy ones again
  const merged = uniq([...existing, ...derived]).filter((t) => !DROP_TAGS.has(t));

  const hasTagsLine = /^tags:\s*\[.*\]\s*$/m.test(fm.raw);
  let newFmText = fm.raw;
  if (merged.length > 0) {
    const newTagsLine = stringifyTags(merged);
    if (hasTagsLine) {
      newFmText = newFmText.replace(/^tags:\s*\[.*\]\s*$/m, newTagsLine);
    } else {
      // Insert tags before closing ---
      newFmText = newFmText.replace(/\n?$/, '');
      newFmText += `\n${newTagsLine}\n`;
    }
  }

  // Strip categories line entirely
  newFmText = newFmText
    .split('\n')
    .filter((line) => !/^categories:\s*\[.*\]\s*$/.test(line.trim()))
    .join('\n')
    // collapse any accidental multiple blank lines in FM
    .replace(/\n{3,}/g, '\n\n');

  const updated = src.slice(0, fm.start) + `---\n${newFmText}\n---\n` + src.slice(fm.end);
  if (updated !== src) {
    await fs.writeFile(filePath, updated, 'utf8');
    return { filePath, tags: merged };
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
      console.error('Failed:', fp, e.message);
    }
  }

  // Summary output
  console.log(`Updated ${results.length} files.`);
  for (const r of results.slice(0, 20)) {
    console.log('-', r.filePath, '=>', r.tags.join(', '));
  }
  if (results.length > 20) console.log('...');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const sourcePath = '/Users/bongholee/blog/BongHoLee.github.io/_posts';
const targetPath = '/Users/bongholee/blog/bongholee-astro-blog/src/content/blog';

// 카테고리 매핑
const categoryMapping = {
  'Keywords': 'Programming',
  'Keywords/OOP': 'Programming',
  'Others/Design': 'System-Design',
  'ProgramingLanguage/Java': 'Programming',
  'ProgramingLanguage/Python': 'Programming',
  'Books/CleanCode': 'Book-Review',
  'Algorithm': 'Algorithm',
  'CS': 'Programming',
  'Framework': 'Programming'
};

// 포스트에서 첫 번째 문단을 description으로 추출
function extractDescription(content) {
  const lines = content.split('\n');
  let startIdx = -1;
  
  // front matter 이후 첫 번째 내용 찾기
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---' && i > 0) {
      startIdx = i + 1;
      break;
    }
  }
  
  if (startIdx === -1) return '';
  
  // 첫 번째 비어있지 않은 문단 찾기
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#')) {
      return line.length > 150 ? line.substring(0, 147) + '...' : line;
    }
  }
  
  return '';
}

// Jekyll front matter를 Astro 형식으로 변환
function convertFrontMatter(frontMatterText, filename) {
  const lines = frontMatterText.split('\n');
  let title = '';
  let author = 'Bong5';
  let categories = [];
  let date = '';
  
  // 파일명에서 날짜 추출
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    date = dateMatch[1];
  }
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('title:')) {
      title = trimmed.substring(6).trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('author:')) {
      author = trimmed.substring(7).trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('categories:')) {
      const catStr = trimmed.substring(11).trim();
      if (catStr.startsWith('[') && catStr.endsWith(']')) {
        const cats = catStr.slice(1, -1).split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        categories = cats;
      }
    }
  });
  
  // 카테고리 매핑
  const mappedCategories = categories.map(cat => categoryMapping[cat] || 'Programming');
  const uniqueCategories = [...new Set(mappedCategories)];
  
  // tags 생성 (기존 카테고리를 태그로 변환)
  const tags = categories.map(cat => {
    if (cat.includes('/')) {
      return cat.split('/').pop();
    }
    return cat;
  });
  
  return `---
title: "${title}"
description: "이 포스트에 대한 설명"
pubDate: ${date}
author: "${author}"
categories: [${uniqueCategories.map(c => `"${c}"`).join(', ')}]
tags: [${tags.map(t => `"${t}"`).join(', ')}]
---`;
}

// 메인 마이그레이션 함수
function migratePost(filename) {
  const sourcefile = path.join(sourcePath, filename);
  
  if (!fs.existsSync(sourcefile)) {
    console.log(`Source file not found: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(sourcefile, 'utf8');
  
  // front matter 분리
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontMatterMatch) {
    console.log(`No front matter found in: ${filename}`);
    return;
  }
  
  const frontMatter = frontMatterMatch[1];
  const bodyContent = frontMatterMatch[2];
  
  // description 추출
  const description = extractDescription(bodyContent);
  
  // front matter 변환
  let newFrontMatter = convertFrontMatter(frontMatter, filename);
  if (description) {
    newFrontMatter = newFrontMatter.replace('"이 포스트에 대한 설명"', `"${description}"`);
  }
  
  const newContent = newFrontMatter + '\n\n' + bodyContent;
  
  // 대상 파일명 생성 (소문자, 하이픈으로 변경)
  let newFilename = filename.toLowerCase().replace(/_/g, '-');
  const targetFile = path.join(targetPath, newFilename);
  
  fs.writeFileSync(targetFile, newContent, 'utf8');
  console.log(`Migrated: ${filename} -> ${newFilename}`);
}

// 모든 포스트 마이그레이션
function migrateAllPosts() {
  const files = fs.readdirSync(sourcePath);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  console.log(`Found ${mdFiles.length} markdown files to migrate`);
  
  // 모든 파일 마이그레이션
  const testFiles = mdFiles;
  
  testFiles.forEach(file => {
    try {
      migratePost(file);
    } catch (error) {
      console.error(`Error migrating ${file}:`, error.message);
    }
  });
  
  console.log('Migration completed!');
}

// 실행
migrateAllPosts();
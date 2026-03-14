#!/usr/bin/env node
/**
 * Build script: generates ecomm-html/index.html from summaries_1-4.js
 */

const fs = require('fs');
const path = require('path');

// Load all lessons
const s1 = require('./summaries_1.js');
const s2 = require('./summaries_2.js');
const s3 = require('./summaries_3.js');
const s4 = require('./summaries_4.js');
const allLessons = [...s1, ...s2, ...s3, ...s4];

// Step config
const steps = [
  { num: 1, color: '#6366f1', icon: '💡', title: 'Step 1: เรียนรู้โมเดลธุรกิจ', en: 'Business Model', img: 'step1_business_model.png', navIcon: '💡' },
  { num: 2, color: '#8b5cf6', icon: '🎨', title: 'Step 2: สร้างสรรค์ดีไซน์สินค้า', en: 'Product Design', img: 'step2_design_creation.png', navIcon: '🎨' },
  { num: 3, color: '#ec4899', icon: '🏪', title: 'Step 3: สร้างร้านค้าออนไลน์', en: 'Online Store', img: 'step3_online_store.png', navIcon: '🏪' },
  { num: 4, color: '#f43f5e', icon: '🚀', title: 'Step 4: เพิ่มยอดขายด้วยแอปและคูปอง', en: 'Sales Boost', img: 'step4_apps_coupons.png', navIcon: '🚀' },
  { num: 5, color: '#f97316', icon: '📈', title: 'Step 5: การตลาดและเพิ่มทราฟฟิก', en: 'Marketing & Traffic', img: 'step5_marketing_seo.png', navIcon: '📈' },
  { num: 6, color: '#eab308', icon: '⚙️', title: 'Step 6: จัดการร้านค้าและเติบโต', en: 'Store Management', img: 'step6_store_management.png', navIcon: '⚙️' },
];

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncTitle(title, max = 30) {
  return title.length > max ? title.substring(0, max) + '...' : title;
}

function makePreview(summary, maxLen = 150) {
  const clean = summary.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean;
}

function formatSummary(summary) {
  return esc(summary).replace(/\n/g, '\n\n');
}

// Group lessons by step
const lessonsByStep = {};
allLessons.forEach((l, i) => {
  const s = l.step;
  if (!lessonsByStep[s]) lessonsByStep[s] = [];
  lessonsByStep[s].push({ ...l, lessonNum: i + 1 });
});

// Build sidebar nav
function buildSidebar() {
  let html = '';
  for (const step of steps) {
    const lessons = lessonsByStep[step.num] || [];
    html += `
      <div class="nav-step">
        <button class="nav-step-btn" onclick="toggleNavStep(this)" style="--step-color: ${step.color}">
          <span class="nav-step-icon">${step.navIcon}</span>
          <span class="nav-step-text">Step ${step.num}</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="nav-lessons" style="display:none">`;
    for (const l of lessons) {
      html += `
          <a href="#lesson-${l.lessonNum}" class="nav-lesson-link" data-lesson="${l.lessonNum}" onclick="closeMobileMenu()">
            <span class="nav-lesson-num">${l.lessonNum}</span>
            ${esc(truncTitle(l.title))}
          </a>`;
    }
    html += `
        </div>
      </div>`;
  }
  return html;
}

// Build lesson card
function buildLessonCard(lesson) {
  const step = steps.find(s => s.num === lesson.step);
  const color = step ? step.color : '#6366f1';
  const num = lesson.lessonNum;
  const padNum = String(num).padStart(2, '0');

  let keyPointsHtml = '';
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    keyPointsHtml = `
            <div class="key-points">
              <div class="key-points-header" style="--step-color: ${color}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                ประเด็นสำคัญ (Key Takeaways)
              </div>
              <ul>
${lesson.keyPoints.map(kp => `              <li>${esc(kp)}</li>`).join('\n')}
              </ul>
            </div>`;
  }

  return `
        <article class="lesson-card" id="lesson-${num}" data-step="${lesson.step}">
          <div class="lesson-card-header" style="--step-color: ${color}">
            <span class="lesson-number" style="background: ${color}">${num}</span>
            <h3 class="lesson-title">${esc(lesson.title)}</h3>
          </div>
          <img src="images/lesson_${padNum}.png" alt="Lesson ${num}"
               class="lesson-image" loading="lazy"
               onerror="this.style.display='none'" />
          <div class="lesson-body">
            <div class="lesson-summary-preview">${esc(makePreview(lesson.summary))}</div>
            <div class="lesson-summary-full" style="display:none">${formatSummary(lesson.summary)}</div>
            <button class="read-more-btn" onclick="toggleSummary(this)" style="--step-color: ${color}">
              อ่านต่อ →
            </button>${keyPointsHtml}
          </div>
        </article>`;
}

// Build step sections
function buildStepSections() {
  let html = '';
  for (const step of steps) {
    const lessons = lessonsByStep[step.num] || [];
    html += `
    <section id="step-${step.num}" class="step-section" data-step="${step.num}">
      <div class="step-header" style="--step-color: ${step.color}">
        <div class="step-header-bg" style="background: linear-gradient(135deg, ${step.color}22, ${step.color}08)"></div>
        <div class="step-header-content">
          <div class="step-icon">${step.icon}</div>
          <div>
            <h2 class="step-title">${esc(step.title)}</h2>
            <p class="step-en">${esc(step.en)}</p>
          </div>
        </div>
        <img src="images/${step.img}"
             alt="Step ${step.num}" class="step-image"
             onerror="this.style.display='none'" loading="lazy" />
      </div>

      <div class="lessons-grid">${lessons.map(l => buildLessonCard(l)).join('')}
      </div>
    </section>`;
  }
  return html;
}

// Full HTML
const html = `<!DOCTYPE html>
<html lang="th" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print On Demand By Jarvis | สรุปคอร์ส</title>
  <meta name="description" content="สรุปบทเรียนคอร์ส Print On Demand By Jarvis ทั้ง ${allLessons.length} บทเรียน 6 ขั้นตอน">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* ===== CK Pasta Font ===== */
    @font-face { font-family: 'CkPasta'; src: url('fonts/CkPastaRegular.ttf') format('truetype'); font-weight: 400; font-display: swap; }
    @font-face { font-family: 'CkPasta'; src: url('fonts/CkPastaBold.ttf') format('truetype'); font-weight: 700; font-display: swap; }
    @font-face { font-family: 'CkPastaCute'; src: url('fonts/CkPastaCute.ttf') format('truetype'); font-weight: 400; font-display: swap; }
    @font-face { font-family: 'CkPastaCute'; src: url('fonts/CkPastaBoldCute.ttf') format('truetype'); font-weight: 700; font-display: swap; }

    /* ===== CSS Variables ===== */
    :root {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --bg-sidebar: #ffffff;
      --bg-hero: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      --text: #1e293b;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --border: #e2e8f0;
      --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
      --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03);
      --radius: 16px;
      --radius-sm: 10px;
      --sidebar-width: 280px;
      --font-th: 'CkPasta', 'IBM Plex Sans Thai', 'Sarabun', sans-serif;
      --font-th-cute: 'CkPastaCute', 'CkPasta', sans-serif;
      --font-en: 'Inter', sans-serif;
    }

    [data-theme="dark"] {
      --bg: #0f172a;
      --bg-card: #1e293b;
      --bg-sidebar: #1e293b;
      --text: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border: #334155;
      --shadow: 0 1px 3px rgba(0,0,0,0.3);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.3);
      --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.3);
    }

    /* ===== Reset ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; scroll-padding-top: 80px; }

    body {
      font-family: var(--font-th);
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      transition: background 0.3s, color 0.3s;
      overflow-x: hidden;
    }

    /* ===== Top Nav Bar ===== */
    .topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 0 20px;
      backdrop-filter: blur(10px);
      background: color-mix(in srgb, var(--bg-card) 85%, transparent);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: var(--text);
    }
    .menu-btn:hover { background: var(--border); }
    .menu-btn svg { display: block; }

    .topbar-logo {
      font-family: var(--font-en);
      font-weight: 800;
      font-size: 18px;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .topbar-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-box {
      position: relative;
      width: 240px;
    }
    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-th);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-box input:focus { border-color: #6366f1; }
    .search-box svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .theme-btn {
      background: none;
      border: 1px solid var(--border);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: var(--text);
      font-size: 18px;
      transition: background 0.2s;
    }
    .theme-btn:hover { background: var(--border); }

    .progress-bar {
      position: fixed;
      top: 60px;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #6366f1, #ec4899, #f97316);
      z-index: 999;
      transition: width 0.1s;
      border-radius: 0 2px 2px 0;
    }

    /* ===== Sidebar ===== */
    .sidebar {
      position: fixed;
      top: 63px;
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 16px 0;
      z-index: 900;
      transition: transform 0.3s ease;
    }

    .sidebar::-webkit-scrollbar { width: 4px; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .nav-step { margin-bottom: 2px; }

    .nav-step-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--font-th-cute);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      transition: background 0.2s;
      text-align: left;
    }
    .nav-step-btn:hover { background: color-mix(in srgb, var(--step-color, #6366f1) 8%, transparent); }
    .nav-step-btn.active { background: color-mix(in srgb, var(--step-color, #6366f1) 12%, transparent); }

    .nav-step-icon { font-size: 18px; }
    .nav-step-text { flex: 1; }
    .nav-chevron { transition: transform 0.2s; flex-shrink: 0; }
    .nav-step-btn.active .nav-chevron { transform: rotate(180deg); }

    .nav-lessons { padding: 2px 0 8px 0; }

    .nav-lesson-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px 6px 44px;
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
      line-height: 1.4;
    }
    .nav-lesson-link:hover {
      color: var(--text);
      background: var(--bg);
    }
    .nav-lesson-link.active {
      color: #6366f1;
      font-weight: 600;
    }
    .nav-lesson-num {
      font-family: var(--font-en);
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      min-width: 20px;
    }

    /* ===== Main Content ===== */
    .main {
      margin-left: var(--sidebar-width);
      margin-top: 63px;
      min-height: calc(100vh - 63px);
    }

    /* ===== Hero ===== */
    .hero {
      background: var(--bg-hero);
      padding: 60px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .hero-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }

    .hero-cover {
      width: 200px;
      height: 200px;
      border-radius: 24px;
      object-fit: cover;
      margin: 0 auto 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 4px solid rgba(255,255,255,0.2);
    }

    .hero h1 {
      font-family: var(--font-en);
      font-size: 36px;
      font-weight: 900;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .hero .hero-subtitle {
      font-family: var(--font-th-cute);
      font-size: 22px;
      opacity: 0.9;
      margin-bottom: 16px;
    }
    .hero .hero-stats {
      display: flex;
      gap: 32px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-stat {
      text-align: center;
    }
    .hero-stat-value {
      font-family: var(--font-en);
      font-size: 32px;
      font-weight: 800;
      display: block;
    }
    .hero-stat-label {
      font-size: 14px;
      opacity: 0.8;
    }

    /* ===== Content Area ===== */
    .content {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    /* ===== Step Section ===== */
    .step-section {
      margin-bottom: 48px;
    }

    .step-header {
      position: relative;
      border-radius: var(--radius);
      padding: 32px;
      margin-bottom: 24px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .step-header-bg {
      position: absolute;
      inset: 0;
      border-radius: var(--radius);
    }
    .step-header-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 1;
    }
    .step-icon {
      font-size: 40px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-card);
      border-radius: 16px;
      box-shadow: var(--shadow);
      flex-shrink: 0;
    }
    .step-title {
      font-family: var(--font-th-cute);
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
    }
    .step-en {
      font-family: var(--font-en);
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 2px;
    }
    .step-image {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      border-radius: 12px;
      margin-top: 20px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    /* ===== Lesson Card ===== */
    .lessons-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .lesson-card {
      background: var(--bg-card);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: box-shadow 0.3s, transform 0.2s;
    }
    .lesson-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .lesson-card-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--step-color) 8%, transparent), transparent);
      border-bottom: 1px solid var(--border);
    }

    .lesson-number {
      font-family: var(--font-en);
      font-weight: 800;
      font-size: 14px;
      color: white;
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .lesson-title {
      font-family: var(--font-en);
      font-size: 16px;
      font-weight: 700;
      line-height: 1.3;
    }

    .lesson-image {
      width: 100%;
      display: block;
      border-bottom: 1px solid var(--border);
    }

    .lesson-body {
      padding: 20px;
    }

    .lesson-summary-preview, .lesson-summary-full {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-secondary);
      white-space: pre-line;
    }

    .read-more-btn {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 16px;
      border: 1px solid var(--step-color, #6366f1);
      border-radius: 8px;
      background: transparent;
      color: var(--step-color, #6366f1);
      font-family: var(--font-th);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .read-more-btn:hover {
      background: var(--step-color, #6366f1);
      color: white;
    }

    .key-points {
      margin-top: 16px;
      padding: 16px;
      background: color-mix(in srgb, var(--step-color, #6366f1) 4%, var(--bg));
      border-radius: var(--radius-sm);
      border: 1px solid color-mix(in srgb, var(--step-color, #6366f1) 15%, transparent);
    }
    .key-points-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 8px;
      color: var(--step-color, #6366f1);
    }
    .key-points ul {
      list-style: none;
      padding: 0;
    }
    .key-points li {
      padding: 4px 0 4px 20px;
      position: relative;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
    }
    .key-points li::before {
      content: '✦';
      position: absolute;
      left: 0;
      color: var(--step-color, #6366f1);
      font-size: 10px;
      top: 8px;
    }

    .lesson-card.search-hidden { display: none; }
    .lesson-card.search-match { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
    .step-section.search-hidden { display: none; }

    /* ===== No Results ===== */
    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
      display: none;
    }
    .no-results.visible { display: block; }
    .no-results-icon { font-size: 48px; margin-bottom: 12px; }

    /* ===== Footer ===== */
    .footer {
      text-align: center;
      padding: 32px 20px;
      color: var(--text-muted);
      font-size: 14px;
      border-top: 1px solid var(--border);
    }

    /* ===== Back to Top ===== */
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #6366f1;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99,102,241,0.4);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s;
      z-index: 800;
    }
    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .back-to-top:hover { background: #4f46e5; }

    /* ===== Sidebar Overlay (mobile) ===== */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 899;
    }
    .sidebar-overlay.open { display: block; }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 260px;
      }
      .sidebar.open { transform: translateX(0); }
      .main { margin-left: 0; }
      .menu-btn { display: block; }
      .search-box { width: 140px; }
      .hero { padding: 40px 20px; }
      .hero h1 { font-size: 24px; }
      .hero .hero-subtitle { font-size: 18px; }
      .hero-cover { width: 140px; height: 140px; }
      .step-header { padding: 20px; }
      .step-icon { width: 48px; height: 48px; font-size: 28px; }
      .step-title { font-size: 18px; }
      .lesson-body { padding: 16px; }
      .content { padding: 20px 12px 60px; }
    }

    @media (max-width: 480px) {
      .topbar-logo { font-size: 14px; }
      .search-box { width: 100px; }
      .hero-stats { gap: 16px; }
      .hero-stat-value { font-size: 24px; }
      .lesson-card {
        border-radius: 12px;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <nav class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" onclick="toggleSidebar()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
      <span class="topbar-logo">POD by Jarvis</span>
    </div>
    <div class="topbar-right">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="ค้นหาบทเรียน..." oninput="searchLessons(this.value)" />
      </div>
      <button class="theme-btn" onclick="toggleTheme()" aria-label="Toggle theme">
        <span id="theme-icon">🌙</span>
      </button>
    </div>
  </nav>

  <!-- Scroll Progress -->
  <div class="progress-bar" id="progressBar"></div>

  <!-- Sidebar Overlay (mobile) -->
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeMobileMenu()"></div>

  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div style="padding: 0 16px 12px; font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      📚 เนื้อหาทั้งหมด
    </div>
    ${buildSidebar()}
  </aside>

  <!-- Main -->
  <main class="main">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-content">
        <img src="images/cover.png" alt="Course Cover" class="hero-cover" onerror="this.style.display='none'" />
        <h1>Print On Demand By Jarvis</h1>
        <p class="hero-subtitle">คอร์สธุรกิจพิมพ์ตามสั่งด้วย AI</p>
        <p style="font-size:14px; opacity:0.8; margin-bottom:24px;">สรุปเนื้อหาทั้ง ${allLessons.length} บทเรียน 6 ขั้นตอน</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">${allLessons.length}</span>
            <span class="hero-stat-label">บทเรียน</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">6</span>
            <span class="hero-stat-label">ขั้นตอน</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">AI</span>
            <span class="hero-stat-label">Powered</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
${buildStepSections()}

      <div class="no-results" id="noResults">
        <div class="no-results-icon">🔍</div>
        <p>ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      สรุปคอร์ส Print On Demand By Jarvis &bull; สร้างด้วย ❤️
    </div>
  </main>

  <!-- Back to Top -->
  <button class="back-to-top" id="backToTop" onclick="scrollToTop()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
  </button>

  <script>
    // ===== Theme Toggle =====
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
      localStorage.setItem('theme', next);
    }
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    // ===== Sidebar Toggle =====
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarOverlay').classList.toggle('open');
    }
    function closeMobileMenu() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
    }

    // ===== Nav Step Toggle =====
    function toggleNavStep(btn) {
      const isActive = btn.classList.contains('active');
      // Close all
      document.querySelectorAll('.nav-step-btn').forEach(b => {
        b.classList.remove('active');
        b.parentElement.querySelector('.nav-lessons').style.display = 'none';
      });
      // Open clicked if was closed
      if (!isActive) {
        btn.classList.add('active');
        btn.parentElement.querySelector('.nav-lessons').style.display = 'block';
      }
    }

    // ===== Read More Toggle =====
    function toggleSummary(btn) {
      const body = btn.parentElement;
      const preview = body.querySelector('.lesson-summary-preview');
      const full = body.querySelector('.lesson-summary-full');
      if (full.style.display === 'none') {
        full.style.display = 'block';
        preview.style.display = 'none';
        btn.textContent = '← ย่อ';
      } else {
        full.style.display = 'none';
        preview.style.display = 'block';
        btn.textContent = 'อ่านต่อ →';
      }
    }

    // ===== Search =====
    function searchLessons(query) {
      const q = query.toLowerCase().trim();
      const cards = document.querySelectorAll('.lesson-card');
      const sections = document.querySelectorAll('.step-section');
      const noResults = document.getElementById('noResults');
      let found = 0;

      if (!q) {
        cards.forEach(c => { c.classList.remove('search-hidden', 'search-match'); });
        sections.forEach(s => { s.classList.remove('search-hidden'); });
        noResults.classList.remove('visible');
        return;
      }

      const stepVisible = {};
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const match = text.includes(q);
        card.classList.toggle('search-hidden', !match);
        card.classList.toggle('search-match', match);
        if (match) {
          found++;
          stepVisible[card.dataset.step] = true;
        }
      });

      sections.forEach(s => {
        s.classList.toggle('search-hidden', !stepVisible[s.dataset.step]);
      });

      noResults.classList.toggle('visible', found === 0);
    }

    // ===== Scroll Progress =====
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      document.getElementById('progressBar').style.width = progress + '%';

      // Back to top button
      const btn = document.getElementById('backToTop');
      btn.classList.toggle('visible', scrollTop > 500);
    });

    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Auto-open first step in sidebar =====
    const firstStepBtn = document.querySelector('.nav-step-btn');
    if (firstStepBtn) toggleNavStep(firstStepBtn);
  </script>

</body>
</html>`;

// Write output
const outPath = path.join(__dirname, 'ecomm-html', 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Built ${outPath} — ${allLessons.length} lessons, ${html.split('\n').length} lines`);

// Mock HTML content for Home page article body
// Exported as `homeContent` so it can be used in Home.vue via v-html
export const homeContent = `
<p class="intro">在信息爆炸的时代，极简主义不仅是一种设计风格，更是一种生存策略。本文将分享如何在生活与工作中找到简化之道。</p>

<h2 id="section1">1. 什么是真正的极简主义</h2>
<p>极简主义不是单纯地减少物品，而是有意识地保留最重要的事物，消除干扰。它适用于物理空间、数字环境以及思维方式。</p>

<blockquote>
  “简单是复杂的最终形式。” —— 列奥纳多·达·芬奇
</blockquote>

<h2 id="section2">2. 数字断舍离实践</h2>
<p>每天我们花费数小时在数字设备上。以下是一些实践建议：</p>
<ul>
  <li>关闭非必要通知</li>
  <li>使用专注模式应用</li>
  <li>定期清理订阅和收藏</li>
</ul>

<h2 id="section3">3. 工作空间的简化</h2>
<p>物理环境直接影响效率。一个简洁的工作桌应只包含：</p>
<ol>
  <li>当前任务所需物品</li>
  <li>一件提升心情的物品（如植物）</li>
  <li>必要的工作设备</li>
</ol>

<!-- 代码示例 -->
<h3>CSS 极简重置示例</h3>
<pre><code class="language-css">
/* 极简CSS重置 */
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', sans-serif;
line-height: 1.6;
color: var(--text-primary);
background: var(--bg-primary);
}

:root {
--bg-primary: #ffffff;
--text-primary: #2c3e50;
--accent-color: #e74c3c;
}
</code></pre>

<h2 id="section4">4. 持续维护的习惯</h2>
<p>极简主义需要定期维护。建议每周花15分钟：</p>
<table>
  <tr>
    <th>周一</th>
    <th>周三</th>
    <th>周五</th>
  </tr>
  <tr>
    <td>清理邮箱</td>
    <td>整理书签</td>
    <td>归档文件</td>
  </tr>
</table>
`

// Additional simple mock data used by Home.vue
export const mockLatestArticles = [
  {
    id: 1,
    title: '如何保持极简主义生活与工作平衡',
    summary: '探讨在数字时代如何简化工作流程，减少干扰...',
    publishedAt: '2023-10-15T10:00:00Z'
  },
  {
    id: 2,
    title: '现代CSS布局的实用技巧',
    summary: 'Flexbox、Grid和容器查询的实际应用案例...',
    publishedAt: '2023-10-10T14:30:00Z'
  },
  {
    id: 3,
    title: '为什么写作是思考的最佳工具',
    summary: '写作不仅是表达，更是理清思维的过程...',
    publishedAt: '2023-10-05T09:15:00Z'
  }
]

export const mockCatalog = [
  { id: 1, text: '什么是真正的极简主义', level: 2 },
  { id: 2, text: '数字断舍离实践', level: 2 },
  { id: 3, text: '工作空间的简化', level: 2 },
  { id: 4, text: '持续维护的习惯', level: 2 }
]

export const mockTags = ['极简主义', '技术', '生活', '写作', '设计']

// `homeContent` is exported as a named export above. Do not export it as default here
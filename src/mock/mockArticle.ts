import { ref } from "vue"
import type { Article } from "@/types/article"
import { getUser0 } from "./mockUser"
import type { PageResult } from "@/types/api"

export function getArticles(current: number, size: number): PageResult<Article> {
  const articles = ref<Article[]>([
    {
      id: 1,
      title: '秋日读书笔记：山月记中的自我追寻',
      content: '读《山月记》最触动我的是那句"我深怕自己本非美玉，故而不敢加以刻苦琢磨..."，这句话道出了多少人在自我认知与价值实现之间的挣扎...',
      summary: '读《山月记》最触动我的是那句"我深怕自己本非美玉，故而不敢加以刻苦琢磨..."，这句话道出了多少人在自我认知与价值实现之间的挣扎...',
      category: '书评',
      tags: ['读书', '文学', '感悟'],
      publishedAt: '2026-01-19',
      comments: 12,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 2,
      title: '草莓熟了',
      content: '欢迎本博客的小公主：草莓。时间过得真快，转眼间我们的家庭迎来了新成员...',
      summary: '欢迎本博客的小公主：草莓。时间过得真快，转眼间我们的家庭迎来了新成员...',
      category: '日记',
      tags: ['生活', '家庭', '成长'],
      publishedAt: '2025-01-19',
      date: '2025-01-19',
      comments: 12,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 3,
      title: '我的2025：新阶段',
      content: '例行年度总结，总结维度和去年相同，顺序略有调整。今年在生活上有买房、装修、结婚、生娃几件事...',
      summary: '例行年度总结，总结维度和去年相同，顺序略有调整。今年在生活上有买房、装修、结婚、生娃几件事...',
      category: '日记',
      tags: ['年度总结', '生活', '工作'],
      publishedAt: '2025-01-11',
      date: '2025-01-11',
      comments: 14,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 4,
      title: '武汉新天地周末随记',
      content: '周末难得闲暇，天气也正好，一家人一拍即合，决定出门走走。目的地选在了武汉新天地...',
      summary: '周末难得闲暇，天气也正好，一家人一拍即合，决定出门走走。目的地选在了武汉新天地...',
      category: '旅行',
      tags: ['旅行', '武汉', '家庭'],
      publishedAt: '2026-01-20',
      date: '2026-01-20',
      comments: 4,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 5,
      title: '谁在偷听我的电话？一次"AI速记"引发的隐私困惑',
      content: '昨天中午，我给银行打电话咨询业务，通话一分多钟时，手机突然弹出一个提示界面，说可以使用"AI速记"...',
      summary: '昨天中午，我给银行打电话咨询业务，通话一分多钟时，手机突然弹出一个提示界面，说可以使用"AI速记"...',
      category: '生活',
      tags: ['科技', '隐私', 'AI'],
      publishedAt: '2026-01-09',
      date: '2026-01-09',
      comments: 4,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 6,
      title: '晨间日记的实践：如何通过写作整理思绪',
      content: '坚持写晨间日记三个月，最大的收获不是记录了多少内容，而是培养了一种与自我对话的习惯...',
      summary: '坚持写晨间日记三个月，最大的收获不是记录了多少内容，而是培养了一种与自我对话的习惯...',
      category: '随笔',
      tags: ['写作', '习惯', '自我成长'],
      publishedAt: '2025-12-28',
      comments: 8,
      author: getUser0(),
      status: 'draft'
    },
    {
      id: 7,
      title: '车辆第一次出故障',
      content: '前两天早上和往常一样下班前提前把车启动车辆，发现远程系统自动启动了远程...',
      summary: '前两天早上和往常一样下班前提前把车启动车辆，发现远程系统自动启动了远程...',
      category: '生活',
      tags: ['汽车', '生活记录'],
      publishedAt: '2025-11-21',
      date: '2025-11-21',
      comments: 13,
      author: getUser0(),
      status: 'draft'
    }
  ])
  return {
    records: articles.value,
    pagination: {
      current,
      size,
      total: articles.value.length
    }
  }
}

export function getArticleDetail() {
  return {
    id: 1,
    title: '秋日读书笔记：山月记中的自我追寻',
    content: `
    <h2 class="__web-inspector-hide-shortcut__">《山月记》：李徵的“山月”之下，我看到了我与今日头条</h2><p data-track="21"><span style="letter-spacing: 0.5px;"><span style="color: #060607; --tt-darkmode-color: #A3A3A6;">《山月记》是日本作家中岛敦创作的一部短篇小说，取材于中国唐传奇《人虎传》。小说讲述了唐代才子李徵的故事，他年纪轻轻就金榜题名，本应前途无量，却因不甘与庸人为伍，又不得不为五斗米折腰。在郁郁不得志中，李徵的人格渐渐扭曲，最终丧失人性变成了一只狂暴的猛虎，终夜徘徊在山间的冷月残光下。</span></span><br><br></p><h3>李徵的悲剧</h3><p data-track="27"><span style="letter-spacing: 0.5px;"><span style="color: #060607; --tt-darkmode-color: #A3A3A6;">李徵的悲剧，源于他对自我价值的过度追求和对现实的不满。他自视甚高，不愿与同僚同流合污，辞官回家醉心于创作，希望能够流芳百世。然而，现实却并不如他所愿，他的才华并未得到认可，生活也陷入困境。在这种自卑与自傲的双重压力下，李徵的精神逐渐崩溃，最终化为猛虎。</span></span></p><h3>深怕自己本非美玉</h3><p data-track="30"><span style="letter-spacing: 0.5px;"><span style="color: #060607; --tt-darkmode-color: #A3A3A6;">“我深怕自己本非美玉，故而不敢加以刻苦琢磨，却又半信自己是块美玉，故又不肯庸庸碌碌，与瓦砾也伍。”这句话正是李徵内心矛盾的真实写照，也是我在今日头条上创作的一种状态。我常常希望我的作品能够推送给更多的人，获得更大的认同感和成就感；同时常常会害怕自己的作品写的比较烂，没有得到更大的引流，也得不到观众朋友们的肯定，不敢去害怕自己的平凡，却又不愿意就此放弃，所以经常在发布作品之后时不时去点进去看看，是不是有朋友认可我的文字。</span></span></p>
    `,
    category: '书评',
    tags: ['读书', '文学', '感悟'],
    publishedAt: '2026-01-19',
    summary: '读《山月记》最触动我的是那句"我深怕自己本非美玉，故而不敢加以刻苦琢磨..."，这句话道出了多少人在自我认知与价值实现之间的挣扎...',
    coverImage: '',
    isLiked: true,
    isBookmarked: false,
    views: 0,
    likes: 0,
    comments: 10,
    author: getUser0(),
    description: '',
    readTime: 0,
    featuredImage: '',
    imageCaption: '',
    enableReward: true
  }
}

export default {
  getArticles,
  getArticleDetail
}
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PhotoItem } from '@/types/photo'

export const usePhotoStore = defineStore('photo', () => {
    // 状态
    const photos = ref<PhotoItem[]>([])
    // const isLoading = ref(true)
    
    // 计算属性
    
    // 方法
    const fetchPhotos = async (payload: Object = {current: 1, pageSize: 4}) => {
        // isLoading.value = true
        try {
            // 调用API
            photos.value = mockImages()
            mockMoreImages()

        } catch (error) {
            
        } finally {
            // isLoading.value = false
        }
    }

    // 模拟数据
    function mockImages(): PhotoItem[] {
      const images = ref<PhotoItem[]>([
        {
          id: 1,
          url: 'https://picsum.photos/400/300?random=1',
          title: '山间晨雾',
          description: '清晨的第一缕阳光穿过薄雾，洒在山间小路上，宁静而美好。',
          date: '2024-01-15',
          category: '自然风光',
          width: 400,
          height: 300
        },
        {
          id: 2,
          url: 'https://picsum.photos/400/500?random=2',
          title: '城市夜景',
          description: '繁华的都市夜景，灯火辉煌，展现现代城市的魅力。',
          date: '2024-01-14',
          category: '城市建筑',
          width: 400,
          height: 500
        },
        {
          id: 3,
          url: 'https://picsum.photos/400/400?random=3',
          title: '海滩日落',
          description: '金色的夕阳映照在海面上，波光粼粼，浪漫至极。',
          date: '2024-01-13',
          category: '旅行摄影',
          width: 400,
          height: 400
        },
        {
          id: 4,
          url: 'https://picsum.photos/400/600?random=4',
          title: '雪山之巅',
          description: '雄伟的雪山在蓝天白云的映衬下更显壮丽。',
          date: '2024-01-12',
          category: '自然风光',
          width: 400,
          height: 600
        },
        {
          id: 5,
          url: 'https://picsum.photos/400/350?random=5',
          title: '森林小径',
          description: '幽静的森林小径，阳光透过树叶洒下斑驳的光影。',
          date: '2024-01-11',
          category: '自然风光',
          width: 400,
          height: 350
        },
        {
          id: 6,
          url: 'https://picsum.photos/400/450?random=6',
          title: '古镇风情',
          description: '古老的建筑，青石板路，感受历史的韵味。',
          date: '2024-01-10',
          category: '人文纪实',
          width: 400,
          height: 450
        }
      ])
      return images.value;
    }

    // 初始化时添加更多图片
    function mockMoreImages(): void {
      for (let i = 7; i <= 50; i++) {
        photos.value.push({
          id: i,
          url: `https://picsum.photos/400/${300 + Math.floor(Math.random() * 300)}?random=${i}`,
          title: `图片 ${i}`,
          description: `这是第 ${i} 张图片的描述内容，展示美丽的风景和精彩的瞬间。`,
          date: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
          category: randomCategory(),
          width: 400,
          height: 300 + Math.floor(Math.random() * 300)
        })
      }
    }

    function randomCategory(): string {
      const categoires: string[] = ['自然风光', '城市建筑', '旅行摄影', '人文纪实']
      const index = Math.floor(Math.random() * categoires.length)
      return categoires[index] || ''
    }

    return {
        photos,
        // isLoading,

        fetchPhotos
    }
})
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 按分类导入常用图标
import { 
  faSearch, 
  faUser, 
  faHome,
  faCog,
  faBars,
  faTimes,
  faArrowRight,
  faPlus,
  faEdit,
  faTrash,
  faDownload,
  faComment,
  faHouse
} from '@fortawesome/free-solid-svg-icons'

import { 
  faGithub, 
  faTwitter,
  faFacebook,
  faWeibo,
  faQq
} from '@fortawesome/free-brands-svg-icons'

import { 
  faStar as farStar,
  faHeart as farHeart,
  faBell as farBell
} from '@fortawesome/free-regular-svg-icons'

// 添加所有要用到的图标
library.add(
  // solid
  faSearch, faUser, faHome, faCog, faBars, faTimes,
  faArrowRight, faPlus, faEdit, faTrash, faDownload,
  faComment, faHouse,
  
  // brands
  faGithub, faTwitter, faFacebook, faWeibo, faQq,
  
  // regular
  farStar, farHeart, farBell
)

export default {
  install(app: any) {
    // 全局注册组件，可自定义名称
    app.component('FaIcon', FontAwesomeIcon)
    app.component('FontAwesomeIcon', FontAwesomeIcon)
  }
}
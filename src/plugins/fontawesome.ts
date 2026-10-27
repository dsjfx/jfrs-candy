import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 按分类导入常用图标
import {
  faArrowRight,
  faBars,
  faCog,
  faComment,
  faCaretDown,
  faCaretUp,
  faCaretLeft,
  faCaretRight,
  faDownload,
  faEdit,
  faEllipsis,
  faEllipsisH,
  faEllipsisV,
  faEllipsisVertical,
  faEyeSlash,
  faFlag,
  faGlobe,
  faHome,
  faHouse,
  faPen,
  faPenToSquare,
  faPlus,
  faRefresh,
  faReply,
  faSearch,
  faThumbsUp,
  faThumbsDown,
  faTimes,
  faTrash,
  faTrashCan,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import {
  faFacebook,
  faGithub,
  faQq,
  faTwitter,
  faWeibo,
} from '@fortawesome/free-brands-svg-icons'

import {
  faBell as farBell,
  faBookmark as farBookmark,
  faCalendar as farCalendar,
  faClock as farClock,
  faComment as farComment,
  faCommentAlt as farCommentAlt,
  faCommentDots as farCommentDots,
  faEnvelope as farEnvelope,
  faEye as farEye,
  faFile as farFile,
  faHeart as farHeart,
  faImage as farImage,
  faPaperPlane as farPaperPlane,
  faStar as farStar,
  faThumbsDown as farThumbsDown,
  faThumbsUp as farThumbsUp,
  faUser as farUser,
} from '@fortawesome/free-regular-svg-icons'

// 添加所有要用到的图标
library.add(
  // solid
  faArrowRight, faBars, faCog, faComment, faCaretDown, faCaretUp,
  faCaretLeft, faCaretRight,
  faDownload, faEdit, faEllipsis, faEllipsisH, faEllipsisV,
  faEllipsisVertical, faEyeSlash, faFlag, faGlobe, faHome, faHouse,
  faPen, faPenToSquare, faPlus, faRefresh, faReply, faSearch, faThumbsUp,
  faThumbsDown, faTimes, faTrash, faTrashCan, faUser,

  // brands
  faFacebook, faGithub, faQq, faTwitter, faWeibo,

  // regular
  farBell, farBookmark, farCalendar, farClock, farComment, farCommentAlt,
  farCommentDots, farEnvelope, farEye, farFile, farHeart,
  farImage, farPaperPlane, farStar, farThumbsDown, farThumbsUp, farUser
)

export default {
  install(app: any) {
    // 全局注册组件，可自定义名称
    app.component('FaIcon', FontAwesomeIcon)
    app.component('FontAwesomeIcon', FontAwesomeIcon)
  }
}
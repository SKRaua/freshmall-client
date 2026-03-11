<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="brand" @click="router.push({ name: 'home' })">
        <img :src="Logo" alt="logo" />
        <span>鲜果商城</span>
      </div>

      <nav class="menu">
        <button v-for="item in menuData" :key="item.link" :class="['menu-item', { active: item.link === selectedMenu }]"
          @click="clickMenu(item)">
          {{ item.title }}
        </button>
      </nav>

      <div class="search-box">
        <img :src="SearchIcon" alt="搜索" />
        <input ref="keywordRef" placeholder="搜索商品" @keyup.enter="search" />
      </div>

      <div class="right-zone">
        <a-badge :count="msgData.length" :number-style="{ backgroundColor: '#e2df46', color: '#333' }">
          <button class="icon-btn" @click="msgVisible = true">
            <img :src="MessageIcon" alt="消息" />
          </button>
        </a-badge>

        <template v-if="userStore.user_token">
          <a-dropdown>
            <a class="avatar-link" @click="(e) => e.preventDefault()">
              <img :src="avatarUrl ? avatarUrl : AvatarIcon" class="avatar" alt="avatar" />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a @click="goUserCenter('userInfoEditView')">个人设置</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="quit()">退出登录</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <button v-else class="login-btn" @click="goLogin">登录</button>
      </div>
    </div>

    <a-drawer title="系统通知" placement="right" :closable="true" :maskClosable="true" :visible="msgVisible"
      @close="onClose">
      <a-spin :spinning="loading" style="min-height: 120px">
        <div v-if="msgData.length" class="notify-list">
          <article class="notify-item" v-for="(item, index) in msgData" :key="item.id || index">
            <h4>{{ item.title }}</h4>
            <p class="time">{{ item.createTime }}</p>
            <p>{{ item.content }}</p>
          </article>
        </div>
        <a-empty v-else description="暂无通知" />
      </a-spin>
    </a-drawer>
  </header>
</template>

<script setup>
import { listApi } from '/@/api/notice';
import { useUserStore } from '/@/store';
import Logo from '/@/assets/images/logo.png';
import SearchIcon from '/@/assets/images/search-icon.svg';
import AvatarIcon from '/@/assets/images/avatar.jpg';
import MessageIcon from '/@/assets/images/ic-message.png';
import { message } from 'ant-design-vue';
import { detailApi } from '/@/api/user';
import { BASE_URL } from '/@/store/constants';
import { getFormatTime } from '/@/utils';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const keywordRef = ref();

let loading = ref(false);
let msgVisible = ref(false);
let msgData = ref([]);
let avatarUrl = ref(undefined);
let selectedMenu = ref('');
let menuData = ref([
  { link: 'home', title: '首页' },
  { link: 'cartView', title: '购物车' },
  { link: 'orderView', title: '订单' },
  { link: 'usercenter', title: '个人中心' },
  // { link: 'admin', title: '后台管理' },
]);

onMounted(() => {
  getMessageList();
  getUserInfo();
});

watch(
  () => route.path,
  (newPath, _) => {
    if (newPath.indexOf('/index/home') > -1) {
      selectedMenu.value = 'home';
    } else if (newPath.indexOf('/index/cart') > -1) {
      selectedMenu.value = 'cartView';
    } else if (newPath.indexOf('/index/order') > -1) {
      selectedMenu.value = 'orderView';
    } else if (newPath.indexOf('/index/usercenter') > -1) {
      selectedMenu.value = 'usercenter';
    }
  },
  { immediate: true },
);

const clickMenu = (item) => {
  if ((item.link === 'cartView' || item.link === 'orderView') && !userStore.user_token) {
    message.warn('请先登录！');
    router.push({ name: 'login' });
    return;
  }
  router.push({ name: item.link });
};

const getUserInfo = () => {
  let userId = userStore.user_id;
  if (userId) {
    detailApi({ id: userId })
      .then((res) => {
        if (res.data && res.data.avatar) {
          avatarUrl.value = BASE_URL + '/api/staticfiles/avatar/' + res.data.avatar;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const getMessageList = () => {
  loading.value = true;
  listApi({})
    .then((res) => {
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((item) => {
          item.createTime = getFormatTime(item.createTime, true);
        });
        msgData.value = res.data;
      } else {
        msgData.value = [];
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
};
const search = () => {
  const keyword = keywordRef.value?.value?.trim();
  if (!keyword) {
    return;
  }
  if (route.name === 'search') {
    router.push({ name: 'search', query: { keyword } });
    return;
  }
  router.push({ name: 'search', query: { keyword } });
};
const goLogin = () => {
  router.push({ name: 'login' });
};

const goUserCenter = (menuName) => {
  router.push({ name: menuName });
};
const quit = () => {
  userStore.logout().then(() => {
    router.push({ name: 'home' });
  });
};
const onClose = () => {
  msgVisible.value = false;
};

</script>

<style scoped lang="less">
@media (max-width: 960px) {
  .menu {
    display: none;
  }

  .search-box {
    width: 140px !important;
    min-width: 140px !important;
  }
}

@media (max-width: 680px) {
  .search-box {
    display: flex !important;
    width: 100% !important;
    min-width: 0 !important;
    margin-left: 0;
    order: 3;
  }

  .header-inner {
    height: auto !important;
    min-height: 64px;
    flex-wrap: wrap;
    row-gap: 8px;
    padding: 0 12px !important;
  }

  .right-zone {
    margin-left: auto;
    order: 2;
  }

  .brand span {
    display: none;
  }
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #f1f1d7;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 20px;
}

.brand {
  display: flex;
  align-items: center;
  cursor: pointer;

  img {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
  }

  span {
    margin-left: 10px;
    font-size: 17px;
    font-weight: 700;
    color: #2e3a28;
  }
}

.menu {
  display: flex;
  align-items: center;
  gap: 6px;

  .menu-item {
    border: none;
    background: transparent;
    padding: 8px 12px;
    border-radius: 999px;
    color: #4a4a4a;
    cursor: pointer;
    transition: all 0.2s;
  }

  .menu-item.active,
  .menu-item:hover {
    background: #f5f5d9;
    color: #3a3a1d;
  }
}

.right-zone {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  margin-left: auto;
  width: 240px;
  min-width: 200px;
  height: 38px;
  border-radius: 999px;
  background: #f7f8e8;
  display: flex;
  align-items: center;
  padding: 0 12px;

  img {
    width: 16px;
    margin-right: 8px;
    opacity: 0.7;
  }

  input {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 14px;
  }
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f7f8e8;
  cursor: pointer;
  display: grid;
  place-items: center;

  img {
    width: 18px;
  }
}

.login-btn {
  border: none;
  background: #e2df46;
  color: #2e2e2e;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.avatar-link {
  display: flex;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.notify-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notify-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8f9ee;

  h4 {
    margin: 0;
    font-size: 14px;
    color: #303030;
  }

  .time {
    margin: 6px 0;
    font-size: 12px;
    color: #909090;
  }

  p {
    margin: 0;
    line-height: 1.5;
    display: flex;
    align-items: center;

    img {
      width: 20px;
      height: 20px;
      object-fit: fill;
    }

    .msg-point {
      position: absolute;
      right: -4px;
      top: 0;
      min-width: 8px;
      width: 8px;
      height: 8px;
      background: #e2df46;
      border-radius: 50%;
    }
  }

  .self-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    vertical-align: middle;
    cursor: pointer;
    object-fit: cover;
  }

  .btn {
    cursor: pointer;
    font-size: 14px;
    color: #eee;
    border-radius: 16px;
    text-align: center;
    width: 66px;
    height: 30px;
    line-height: 30px;
    vertical-align: middle;
    border: 1px solid #eee;
  }
}

.content-list {
  flex: 1;

  .list-title {
    color: #152844;
    font-weight: 600;
    font-size: 18px;
    //line-height: 24px;
    height: 48px;
    margin-bottom: 4px;
    border-bottom: 1px solid #cedce4;
  }
}

.notification-item {
  padding-top: 16px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .content-box {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border-bottom: 1px dashed #e9e9e9;
    padding: 4px 0 16px;
  }

  .header {
    margin-bottom: 12px;
  }

  .title-txt {
    color: #315c9e;
    font-weight: 500;
    font-size: 14px;
  }

  .time {
    color: #a1adc5;
    font-size: 14px;
  }

  .head-text {
    color: #152844;
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;

    .name {
      margin-right: 8px;
    }
  }

  .content {
    margin-top: 4px;
    color: #484848;
    font-size: 14px;
    line-height: 22px;
  }
}
</style>

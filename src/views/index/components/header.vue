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
  </header>
</template>

<script setup>
import { useUserStore } from '/@/store';
import Logo from '/@/assets/images/logo.png';
import SearchIcon from '/@/assets/images/search-icon.svg';
import AvatarIcon from '/@/assets/images/avatar.jpg';
import { message } from 'ant-design-vue';
import { detailApi } from '/@/api/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const keywordRef = ref();

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
          avatarUrl.value = '/api/staticfiles/avatar/' + res.data.avatar;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
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

</script>

<style scoped lang="less">
@media (max-width: 960px) {
  .header-inner {
    gap: 12px;
    padding: 0 12px;
  }

  .search-box {
    width: 180px;
    min-width: 140px;
  }

  .menu .menu-item {
    padding: 6px 10px;
  }
}

@media (max-width: 760px) {
  .header-inner {
    height: auto !important;
    min-height: 64px;
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 8px;
    padding: 8px 12px 10px !important;
  }

  .brand {
    order: 1;
    flex: 0 0 auto;
  }

  .menu {
    order: 2;
    flex: 1 1 auto;
    min-width: 0;
    margin-left: 0;
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 4px;
  }

  .search-box {
    order: 3;
    flex: 1 1 calc(100% - 140px);
    width: auto !important;
    min-width: 0 !important;
    margin-left: 0;
  }

  .right-zone {
    order: 3;
    flex: 0 0 auto;
    margin-left: 8px;
    gap: 8px;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .login-btn {
    padding: 6px 10px;
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
</style>

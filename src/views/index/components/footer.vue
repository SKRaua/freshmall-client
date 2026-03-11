<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="left">鲜果商城 </div>
      <div class="links">
        <!-- <a href="/admin" target="_blank">后台管理</a> -->
        <a @click="handleSource">关于我们</a>
      </div>
    </div>
  </footer>
</template>

<script>
import { Modal } from 'ant-design-vue';

export default {
  name: 'AppFooter',
  data() {
    return {};
  },
  methods: {
    handleSource() {
      Modal.info({
        title: '鲜果商城',
        content: '积极开发中',
        onOk() { },
      });
    },
  },
};
</script>

<style scoped lang="less">
.app-footer {
  margin-top: 32px;
  border-top: 1px solid #f0f0d7;
  background: #fff;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7d7d7d;
  font-size: 13px;
}

.links {
  display: flex;
  gap: 14px;

  a {
    color: #4e5d2f;
    cursor: pointer;
  }
}

@media (max-width: 680px) {
  .footer-inner {
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: 12px;
  }
}
</style>

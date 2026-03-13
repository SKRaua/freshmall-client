<template>
  <div class="content-list">
    <div class="list-title">帐号安全</div>
    <div class="list-content">
      <div class="safe-view">
        <div class="safe-info-box">
          <div class="item flex-view">
            <div class="label">账号安全等级</div>
            <div class="right-box flex-center flex-view">
              <div class="safe-text">低风险</div>
              <progress max="3" class="safe-line" value="2"> </progress>
            </div>
          </div>
        </div>

        <div class="pwd-edit">
          <div class="item flex-view">
            <div class="label">当前密码</div>
            <div class="right-box">
              <a-input-password class="fm-input" placeholder="输入当前密码" v-model:value="password" />
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">新密码</div>
            <div class="right-box">
              <a-input-password class="fm-input" placeholder="输入新密码" v-model:value="newPassword1" />
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">确认新密码</div>
            <div class="right-box">
              <a-input-password class="fm-input" placeholder="重复输入密码" v-model:value="newPassword2" />
            </div>
          </div>
          <div class="item flex-view">
            <div class="label"> </div>
            <div class="right-box">
              <a-button class="fm-btn" @click="handleUpdatePwd()">修改密码</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue';

import { updateUserPwdApi } from '/@/api/user';
import { useUserStore } from '/@/store';

const userStore = useUserStore();

let password = ref('');
let newPassword1 = ref('');
let newPassword2 = ref('');

const handleUpdatePwd = () => {
  if (!password.value || !newPassword1.value || !newPassword2.value) {
    message.warn('不能为空');
    return;
  }
  if (newPassword1.value !== newPassword2.value) {
    message.warn('密码不一致');
    return;
  }

  let userId = userStore.user_id;
  updateUserPwdApi({
    userId: userId,
    password: password.value,
    newPassword: newPassword1.value,
  })
    .then((res) => {
      message.success('修改成功');
    })
    .catch((err) => {
      message.error(err.msg);
    });
};
</script>
<style scoped lang="less">
progress {
  vertical-align: baseline;
}

.flex-view {
  display: flex;
}

input,
textarea {
  outline: none;
  border-style: none;
}

.content-list {
  flex: 1;

  .list-title {
    color: #333324;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    margin-bottom: 14px;
  }

  .list-content {
    background: #fff;
    border: 1px solid #ececcf;
    border-radius: 14px;
    padding: 18px 20px;
  }
}

.safe-view {
  .item {
    align-items: center;
    margin: 20px 0;

    .label {
      width: 100px;
      color: #4d4d39;
      font-weight: 600;
      font-size: 14px;
    }

    .flex-center {
      align-items: center;
    }

    .safe-text {
      color: #d1851f;
      font-weight: 600;
      font-size: 14px;
      margin-right: 14px;
    }

    .safe-line {
      background: #ececcf;
      border-radius: 999px;
      width: 280px;
      height: 8px;
      overflow: hidden;
      color: #e2df46;
    }
  }
}

.fm-btn {
  border: none;
  background: #e2df46;
  color: #2f2f1f;
  font-weight: 700;
  border-radius: 999px;
  height: 38px;
  padding: 0 18px;
}

.fm-btn:hover,
.fm-btn:focus {
  background: #d7d440;
  color: #2f2f1f;
}

:deep(.fm-input .ant-input-affix-wrapper) {
  border: 1px solid #e6e6c8;
  border-radius: 10px;
  height: 40px;
  background: #fff;
  box-shadow: none;
}

:deep(.fm-input .ant-input-affix-wrapper:hover),
:deep(.fm-input .ant-input-affix-wrapper-focused) {
  border-color: #e2df46;
  box-shadow: 0 0 0 2px rgba(226, 223, 70, 0.15);
}

@media (max-width: 760px) {
  .safe-view {
    .item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin: 14px 0;
    }

    .item .label {
      width: auto;
    }

    .item .safe-line {
      width: 180px;
    }
  }
}
</style>

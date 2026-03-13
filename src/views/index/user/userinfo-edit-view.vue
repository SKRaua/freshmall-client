<template>
  <div class="content-list">
    <div class="list-title">个人资料</div>
    <a-spin :spinning="loading" style="min-height: 200px">
      <div class="list-content">
        <div class="edit-view">
          <div class="item flex-view">
            <div class="label">头像</div>
            <div class="right-box avatar-box flex-view">
              <img v-if="tData.form && tData.form.avatar" :src="tData.form.avatar" class="avatar" />
              <img v-else :src="AvatarIcon" class="avatar" />
              <div class="change-tips flex-view">
                <a-upload name="file" accept="image/*" :multiple="false" :before-upload="beforeUpload">
                  <label>点击更换头像</label>
                </a-upload>
                <p class="tip">图片格式支持 PNG、JPEG，小于 1 MB</p>
              </div>
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">昵称</div>
            <div class="right-box">
              <input type="text" v-model="tData.form.nickname" placeholder="请输入昵称" maxlength="20" class="input-dom" />
              <p class="tip">支持中英文，长度不能超过 20 个字符</p>
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">手机号</div>
            <div class="right-box">
              <input type="text" v-model="tData.form.mobile" placeholder="请输入手机号" maxlength="100"
                class="input-dom web-input" />
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">邮箱</div>
            <div class="right-box">
              <input type="text" v-model="tData.form.email" placeholder="请输入" maxlength="100"
                class="input-dom web-input" />
            </div>
          </div>
          <div class="item flex-view">
            <div class="label">个人简介</div>
            <div class="right-box">
              <textarea v-model="tData.form.description" placeholder="请输入简介" maxlength="200" class="intro"> </textarea>
              <p class="tip">限制200字以内</p>
            </div>
          </div>
          <button class="save mg" @click="submit()">保存</button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { detailApi, updateUserInfoApi } from '/@/api/user';
import { useUserStore } from '/@/store';
import AvatarIcon from '/@/assets/images/avatar.jpg';

const router = useRouter();
const userStore = useUserStore();

let loading = ref(false);
let tData = reactive({
  form: {
    avatar: undefined,
    avatarFile: undefined,
    nickname: undefined,
    email: undefined,
    mobile: undefined,
    description: undefined,
  },
});

onMounted(() => {
  getUserInfo();
});

const beforeUpload = (file) => {
  if (file.size && file.size > 1024 * 1024 * 1) {
    alert('图片太大了');
    return;
  }
  // 改文件名
  const fileName = new Date().getTime().toString() + '.' + file.type.substring(6);
  const copyFile = new File([file], fileName);
  console.log(copyFile);
  tData.form.avatarFile = copyFile;
  return false;
};

const getUserInfo = () => {
  loading.value = true;
  let userId = userStore.user_id;
  detailApi({ id: userId })
    .then((res) => {
      if (res.data) {
        tData.form = res.data;
        if (tData.form.avatar) {
          tData.form.avatar = '/api/staticfiles/avatar/' + tData.form.avatar
        }
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
};
const submit = () => {
  let formData = new FormData();
  let userId = userStore.user_id;

  formData.append('id', userId);

  if (tData.form.avatarFile) {
    formData.append('avatarFile', tData.form.avatarFile)
  }
  if (tData.form.nickname) {
    formData.append('nickname', tData.form.nickname);
  }
  if (tData.form.email) {
    formData.append('email', tData.form.email);
  }
  if (tData.form.mobile) {
    formData.append('mobile', tData.form.mobile);
  }
  if (tData.form.description) {
    formData.append('description', tData.form.description);
  }
  updateUserInfoApi(formData)
    .then((res) => {
      message.success('保存成功');
      location.reload();
    })
    .catch((err) => {
      console.log(err);
      message.info(err.msg || '更新失败');
    });
};
</script>

<style scoped lang="less">
input,
textarea {
  border-style: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.flex-view {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.content-list {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  min-width: 0;

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

  .edit-view {
    .item {
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      margin: 24px 0;

      .label {
        width: 100px;
        color: #4d4d39;
        font-weight: 600;
        font-size: 14px;
      }

      .right-box {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        min-width: 0;
      }

      .avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        margin-right: 16px;
        object-fit: cover;
      }

      .change-tips {
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
      }

      label {
        color: #978213;
        font-size: 14px;
        line-height: 22px;
        height: 22px;
        cursor: pointer;
        width: 100px;
        display: block;
      }

      .tip {
        color: #8a8a74;
        font-size: 14px;
        height: 22px;
        line-height: 22px;
        margin: 0;
        width: 100%;
      }

      .right-box {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
      }

      .input-dom {
        width: 400px;
        max-width: 100%;
      }

      .input-dom {
        background: #fff;
        border: 1px solid #e6e6c8;
        border-radius: 10px;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: #2f2f2f;
        padding: 0 12px;
      }

      .input-dom:focus {
        border-color: #e2df46;
        box-shadow: 0 0 0 2px rgba(226, 223, 70, 0.15);
      }

      .tip {
        font-size: 12px;
        line-height: 16px;
        color: #8a8a74;
        height: 16px;
        margin-top: 4px;
      }

      .intro {
        resize: none;
        background: #fff;
        border: 1px solid #e6e6c8;
        border-radius: 10px;
        width: 100%;
        padding: 8px 12px;
        height: 82px;
        line-height: 22px;
        font-size: 14px;
        color: #2f2f2f;
      }

      .intro:focus {
        border-color: #e2df46;
        box-shadow: 0 0 0 2px rgba(226, 223, 70, 0.15);
      }
    }

    .save {
      background: #e2df46;
      border-radius: 32px;
      width: 96px;
      height: 36px;
      line-height: 36px;
      font-size: 14px;
      font-weight: 700;
      color: #2f2f1f;
      border: none;
      outline: none;
      cursor: pointer;
    }

    .save:hover {
      background: #d7d440;
    }

    .mg {
      margin-left: 100px;
    }
  }
}

@media (max-width: 760px) {
  .content-list {
    .list-title {
      font-size: 18px;
      line-height: 26px;
    }

    .list-content {
      padding: 14px 12px;
      border-radius: 12px;
    }

    .edit-view {
      .item {
        align-items: flex-start;
        flex-direction: column;
        margin: 16px 0;

        .label {
          width: auto;
          margin-bottom: 8px;
        }

        .right-box {
          width: 100%;
        }

        .input-dom {
          width: 100%;
        }

        .avatar {
          width: 56px;
          height: 56px;
          margin-right: 12px;
        }
      }

      .mg {
        margin-left: 0;
      }
    }
  }
}
</style>

<template>
  <div class="outer-container">
    <div class="request-body-form">
      <div class="header-bar">
        <a
          class="logo-container"
          href="https://github.com/pengYYYYY"
          target="_blank"
          rel="noopener"
          data-v-a1054bee=""
          data-v-e63c543b=""
        >
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>PY GitHub</title>
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            ></path>
          </svg>
        </a>

        <t-tabs v-model="type">
          <t-tab-panel :value="1" label="Auth" />
          <t-tab-panel :value="2" label="AccessToken" />
        </t-tabs>
      </div>

      <t-form
        ref="form"
        class="panel-inner"
        :data="formData"
        :rules="rules"
        label-width="90px"
        :colon="true"
        @submit="onSubmit"
      >
        <t-form-item label="Token" name="token">
          <t-input v-if="type === 2" v-model="formData.token" placeholder="请输入 Access Tokens"></t-input>
          <span v-else>
            <t-tooltip
              v-if="authToken"
              :content="authToken"
              placement="right"
              :overlay-style="{ width: '250px' }"
              show-arrow
            >
              <t-tag theme="primary" variant="light"> Auth Token </t-tag>
            </t-tooltip>
            <t-button v-else theme="primary" type="button" :loading="loading" @click="handleClickGetFigmaAuth">
              figma授权
            </t-button>
          </span>
        </t-form-item>
        <t-form-item label="文件链接" name="fileUrl">
          <t-input v-model="formData.fileUrl" placeholder="请输入"></t-input>
        </t-form-item>
        <t-form-item label="数据层级" name="depth">
          <t-input-number v-model="formData.depth" placeholder="请输入"></t-input-number>
        </t-form-item>
        <t-form-item :label-width="0">
          <t-row :gutter="16" style="width: 100%">
            <t-col :span="6">
              <t-form-item label="获取path" name="havePath">
                <t-switch v-model="formData.havePath" size="large" :label="['开', '关']"></t-switch>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="只获取节点" name="isNodes">
                <t-switch v-model="formData.isNodes" size="large" :label="['开', '关']"></t-switch>
              </t-form-item>
            </t-col>
          </t-row>
        </t-form-item>
        <t-form-item v-if="formData.isNodes" label="过滤节点" name="ids">
          <t-input v-model="formData.ids" placeholder="如0:3,0:1"></t-input>
        </t-form-item>
        <t-form-item label="数据拷贝">
          <t-button
            :disabled="!nodeData"
            theme="primary"
            variant="outline"
            type="button"
            @click="handleClickCopy('node')"
          >
            画布数据
          </t-button>
          <t-button
            :disabled="!nodeData"
            theme="primary"
            variant="outline"
            type="button"
            @click="handleClickCopy('first-frame')"
          >
            首个画板
          </t-button>
          <t-button
            :disabled="!metaData"
            theme="primary"
            variant="outline"
            type="button"
            @click="handleClickCopy('img')"
          >
            资源数据
          </t-button>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit">获取数据</t-button>
          <t-button
            v-if="type === 1"
            theme="warning"
            variant="outline"
            type="button"
            @click="handleClickGetFigmaAuth('reAuth')"
            >重新授权</t-button
          >
          <t-button
            v-if="type === 2"
            theme="warning"
            variant="outline"
            type="button"
            @click="handleClickGetFigmaPersonalToken"
            >如何获取</t-button
          >
        </t-form-item>

        <iframe
          v-if="formData?.fileUrl && nodeData?.thumbnailUrl"
          class="figma-preview-container"
          :src="`https://www.figma.com/embed?embed_host=share&url=${formData.fileUrl} `"
          allowfullscreen
        />
      </t-form>
    </div>
    <t-loading size="small" :loading="loading" show-overlay class="loading-container">
      <DataTree :data="nodeData" />
      <t-divider />
      <DataTree :data="metaData" />
    </t-loading>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useClipboard } from '@vueuse/core';
import DataTree from './component/DataTree.vue';

const getUrlQuery = (params) => {
  return Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
};

const apiUrl = 'https://vercel-figma-api-server.vercel.app';

const redirectUri =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/#/figma'
    : 'https://pengyyyyy.github.io/figma-api-live/#/figma';

const nodeData = ref(null);
const metaData = ref(null);
const loading = ref(false);
const authToken = ref(localStorage.getItem('figmaAuthToken'));

onMounted(async () => {
  const query = window.location.search.substring(1).split('&');

  const params = Object.create(null);
  for (let i = 0; i < query.length; i++) {
    const pos = query[i].split('=');
    if (pos[0]) {
      params[pos[0]] = pos[1] ? pos[1] : '';
    }
  }
  if (params.code && !authToken.value) {
    const { state, code } = params;
    const storageState = localStorage.getItem('figmaAuthState');
    if (storageState !== state) return;
    loading.value = true;
    const res = await fetch(
      `https://figma-api-server-pengyyyyy.vercel.app/figma/auth?${getUrlQuery({
        code,
        redirectUri,
      })}`,
    );
    loading.value = false;
    const result = await res.json();
    authToken.value = result.data.access_token;
    localStorage.setItem('figmaAuthToken', authToken.value);
  }
});

const type = ref(1);
const rules = computed(() => ({
  token: [
    {
      required: type.value !== 1,
      message: '请输入AccessToken',
    },
  ],
  fileUrl: [
    {
      required: true,
      message: '请输入fileUrl',
    },
  ],
  ids: [
    {
      required: true,
      message: '请输入',
    },
  ],
}));
const formData = ref({
  token: '',
  fileUrl: '',
  depth: 0,
  havePath: true,
  isNodes: false,
  ids: '',
});

const onSubmit = async ({ validateResult }) => {
  if (validateResult !== true) return;
  loading.value = true;
  const res = await Promise.all([
    fetch(
      `${apiUrl}/figma/file?${getUrlQuery({
        ...formData.value,
        authToken: authToken.value,
        type: type.value === 1 ? 'authToken' : 'personalToken',
      })}`,
    ),
    fetch(
      `${apiUrl}/figma/images?${getUrlQuery({
        ...formData.value,
        authToken: authToken.value,
        type: type.value === 1 ? 'authToken' : 'personalToken',
      })}`,
    ),
  ]);

  const result = await res[0].json();
  const result2 = await res[1].json();
  loading.value = false;
  nodeData.value = result.data;
  metaData.value = result2.data.meta;
};

const handleClickGetFigmaAuth = (type = '') => {
  if (type === 'reAuth') {
    localStorage.removeItem('figmaAuthToken');
    authToken.value = '';
  }
  const uuid = `${Date.now()}`;
  localStorage.setItem('figmaAuthState', uuid);

  window.location.href = `https://www.figma.com/oauth?client_id=Hn8ZQBrB9AOZaGqPTRZ1w9&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=file_read&state=${uuid}&response_type=code`;
};

const { copy } = useClipboard();

const handleClickCopy = (type) => {
  let res;
  if (type === 'node') {
    res = nodeData.value;
  } else if (type === 'meta') {
    res = metaData.value;
  } else if (type === 'first-frame') {
    res = nodeData.value.document.children[0]?.children[0] as any;
  }
  if (!res) {
    MessagePlugin.error('暂无数据');
    return;
  }
  copy(JSON.stringify(res));
  MessagePlugin.success('复制成功');
};

const handleClickGetFigmaPersonalToken = () => {
  window.open('https://www.figma.com/developers/api#access-tokens');
};
</script>
<style lang="less">
.outer-container {
  display: flex;
  position: relative;
}
.request-body-form {
  width: 500px;
  height: 100vh;
  overflow: auto;
}
.panel-inner {
  padding: 20px;
}
.figma-preview-container {
  width: 460px;
  height: 450px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}
.t-form__label {
  padding-right: 12px;
}
.loading-container {
  display: flex;
  flex-direction: column;
}
.header-bar {
  align-items: center;
  gap: 12px;
  position: relative;
  .logo-container {
    height: 48px;
    display: flex;
    align-items: center;
    position: absolute;
    right: 12px;
    color: rgba(0, 0, 0, 0.6);
    transition: color 0.5s;
    z-index: 100;
    svg {
      height: 24px;
    }
    &:hover {
      color: rgba(0, 0, 0, 0.9);
    }
  }
}
</style>

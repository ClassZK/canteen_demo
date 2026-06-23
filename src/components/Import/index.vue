<template>
  <div class="import-container">
    <div class="handle">
      <ElUpload ref="importRef" :action="importModel.action" :method="importModel.method" :disabled="importModel.loading"
      :accept="importModel.accept" :headers="importModel.headers" :show-file-list="false" :limit="1"
        :before-upload="onUploadBefore" :http-request="mockImport" :on-success="onUploadSuccess" :on-error="onUploadError">
        <template #trigger>
          <ElButton type="primary" :loading="importModel.loading">{{ importModel.name }}导入</ElButton>
        </template>
      </ElUpload>
      <ElButton text @click="onDownloadTemplate">下载导入模板</ElButton>
    </div>
    <div class="tip">请先下载导入模版，严格按照导入模版要求填写。</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import type { UploadProps } from 'element-plus';
import _ from 'tddev/utils';
import Storage from 'tddev/storage';
import { Message, ResponseCodeEnum } from '@/global/const';
import _utils from '@/utils/index';
import { localUploadResponse } from '@/mock/localApi';

const importRef = ref();

const emits = defineEmits(['success']);
const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    }
});

const getTemplateURL = (name: string) => {
    return new URL(`../../assets/template/${name}`, import.meta.url).href;
};

/** 交互反馈数据 */
const importModel = reactive({
  loading: false,
  type: '',
  name: '',
  template: '',
  action: '',
  method: 'POST',
  accept: '.xls,.xlsx',
  headers: {
    'Authorization': Storage.get('token'),
    'X-UDID': Storage.get('browerId'),
    'X-APPID': _.getEnv('appID'),
    'X-TIMESTAMP': _utils.xTimestamp()
  }
});

const ImportTypeInit = () => {
    const importTypeList = {
        user: 'apiXxxxxImport'
    };
    importModel.type = props.type;
    importModel.name = props.name;
    importModel.template = getTemplateURL(`${props.name}导入模板.xlsx`);
    importModel.action = importTypeList[props.type];
};

const onDownloadTemplate = () => {
    let a = document.createElement('a');
    a.href = importModel.template;
    a.download = `${ importModel.name }导入模板`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const onUploadBefore: UploadProps['beforeUpload'] = async (rawFile) => {
  importModel.loading = true;
  const suffixIndex = rawFile.name.lastIndexOf('.');
  const suffix = rawFile.name.slice(suffixIndex).toLocaleLowerCase();
  if (!importModel.accept.includes(suffix)) {
    Message.warning(`仅支持导入 ${importModel.accept} 的文件`);
    importModel.loading = false;
    return false;
  }
  return true;
};

const mockImport: UploadProps['httpRequest'] = async options => {
  onUploadSuccess(localUploadResponse(options.file.name), options.file as any, [] as any);
  return localUploadResponse(options.file.name) as any;
};

const onUploadSuccess: UploadProps['onSuccess'] = (response) => {
  const { code, msg } = response;
  if (code) {
    if (code === ResponseCodeEnum.success) {
      emits('success');
      Message.success(`${ importModel.name }导入成功`);
    } else {
      Message.warning(msg);
    }
  } else {
    Message.warning(`${ importModel.name }导入失败`);
  }
  importModel.loading = false;
  importRef.value.clearFiles();
};

const onUploadError: UploadProps['onError'] = () => {
  importModel.loading = false;
  Message.warning(`${ importModel.name }导入失败`);
};

watch(() => props.type, (value) => {
    if (value) {
      ImportTypeInit();
    }
}, {
  immediate: true
});
</script>

<style lang="scss" scoped></style>

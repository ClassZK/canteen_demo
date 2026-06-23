<template>
  <div class="overview-chunk daily">
    <div class="overview-header">
      <p class="title">日常管理</p>
    </div>
    <ElRow class="check-list">
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('sampleRetention')">
          <p>食品留样</p>
          <img class="icon" src="@/assets/image/10812.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('quarantineInspection')">
          <p>检疫检测</p>
          <img class="icon" src="@/assets/image/10814.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('morningHealthCheck')">
          <p>晨检记录</p>
          <img class="icon" src="@/assets/image/10811.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('cleaningRecord')">
          <p>清洁消毒记录</p>
          <img class="icon" src="@/assets/image/10815.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('tablewareDisinfection')">
          <p>餐具消毒记录</p>
          <img class="icon" src="@/assets/image/10813.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('fourPestDisinfection')">
          <p>四害消杀记录</p>
          <img class="icon" src="@/assets/image/10818.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('safetySelfInspection')">
          <p>安全自查记录</p>
          <img class="icon" src="@/assets/image/10817.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('wasteDisposal')">
          <p>废弃物处置报表</p>
          <img class="icon" src="@/assets/image/10819.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('foodDdditiveUsage')">
          <p>食品添加剂使用记录</p>
          <img class="icon" src="@/assets/image/10816.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('mealAccompaniment')">
          <p>陪餐记录</p>
          <img class="icon" src="@/assets/image/10820.png" />
        </div>
      </ElCol>
      <ElCol :sm="12" :md="8" :lg="6" :xl="4">
        <div class="chunk" @click="onPath('leadershipInspection')">
          <p>视察记录</p>
          <img class="icon" src="@/assets/image/10821.png" />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script lang="ts" setup>
import {} from "vue";
import { useRouter } from "vue-router";

const Router = useRouter();

const onPath = (name: string) => {
  Router.push({ name });
};
</script>

<style lang="scss" scoped>
.check-list {
  padding: var(--gap-md);
  box-sizing: border-box;
  .el-col {
    padding: var(--gap-md);
    box-sizing: border-box;
  }
  .chunk {
    display: flex;
    flex-direction: row;
    padding: var(--gap);
    background: rgb(246, 249, 251);
    border-radius: var(--radius-lg);
    cursor: pointer;
    justify-content: space-between;
    p {
      margin-bottom: 20px;
      color: var(--font-color-md);
      font-size: var(--font-size-md);
    }
    span {
      color: var(--font-color-sm);
      font-size: 24px;
      &.active {
        color: var(--el-color-primary);
      }
    }
    .icon {
      align-self: flex-end;
      width: 42px;
    }
  }
}
</style>

<template>
  <div class="json-container">
    <vue-json-pretty :deep-collapse-children="true" :deep="3" :path="'res'" :data="data"> </vue-json-pretty>
  </div>
</template>

<script setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

defineProps({
  data: {
    type: Object,
    default: () => null,
  },
});
</script>
<style lang="less">
.json-container {
  width: calc(100vw - 500px);
  overflow: auto;
  display: flex;
  border-left: 1px solid #ccc;
  padding: 20px;
  padding-top: 0;
  flex-shrink: 0;
  &:first-child {
    height: 60vh;
  }
  &:last-child {
    height: calc(40vh - 50px);
  }
}
</style>

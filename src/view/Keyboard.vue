<script setup lang="ts">
import YPinyin from '@/components/Pinyin.vue';
import SingleKey from '@/components/key/SingleKey.vue';
import KeyWrap from '@/components/key/KeyWrap.vue';
</script>
<template>
  <div class="y-main">
    <y-pinyin words="键盘测试"></y-pinyin>
    <key-wrap v-slot="{ isKeyPressed }">
      <single-key value="A"></single-key>
      <single-key value="["></single-key>
      <single-key value="\"></single-key>
      <single-key value="`"></single-key>
      <single-key :is-key-pressed="isKeyPressed" value="Tab" :unit="15"></single-key>
      <single-key value="Caps Lock" :unit="175"></single-key>
      <single-key value="Shift" :unit="225"></single-key>
      <single-key value="Ctrl" :unit="125"></single-key>
    </key-wrap>
  </div>
</template>

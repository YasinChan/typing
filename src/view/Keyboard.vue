<script setup lang="ts">
import YPinyin from '@/components/Pinyin.vue';
import SingleKey from '@/components/key/SingleKey.vue';
import KeyWrap from '@/components/key/KeyWrap.vue';
import { KEY_PERMUTATION } from '@/config/key';
</script>
<template>
  <div class="y-main">
    <y-pinyin words="键盘测试"></y-pinyin>
    <key-wrap v-slot="{ isKeyPressed }">
      <template v-for="(value, key) in KEY_PERMUTATION">
        <div class="" :class="['y-keyboard__' + key]">
          <div class="y-keyboard__line" v-for="v in value">
            <single-key
              v-for="item in v"
              :key="item.key"
              :value="item.key"
              :unit="item.unit"
            ></single-key>
          </div>
        </div>
      </template>
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
<style lang="scss">
.y-keyboard__line {
  display: flex;
  justify-content: space-between;
  width: 730px;
}
</style>

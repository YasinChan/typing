<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const route = router.currentRoute.value.params.id;
console.log('route', route);
</script>

<template>
  <div>asdf</div>
</template>

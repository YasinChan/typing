import TimeKeep from '@/view/TimeKeep.vue';
import TimeLimit from '@/view/TimeLimit.vue';
import Keyboard from '@/view/Keyboard.vue';
import User from '@/view/User.vue';

export default [
  { path: '/', component: TimeKeep },
  { path: '/time-limit', component: TimeLimit },
  { path: '/keyboard', component: Keyboard },
  { path: '/user/:id', component: User }
];

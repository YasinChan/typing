import TimeKeep from '@/view/TimeKeep.vue';
import TimeLimit from '@/view/TimeLimit.vue';
import Keyboard from '@/view/Keyboard.vue';
import User from '@/view/User.vue';

export default [
  { path: '/', name: 'TimeKeep', component: TimeKeep },
  { path: '/time-limit', name: 'TimeLimit', component: TimeLimit },
  { path: '/keyboard', name: 'Keyboard', component: Keyboard },
  { path: '/user/:id', name: 'User', component: User }
];

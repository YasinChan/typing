import TimeKeep from '@/view/TimeKeep.vue';
import TimeLimit from '@/view/TimeLimit.vue';
import TypingKeyboard from '@/view/TypingKeyboard.vue';
import User from '@/view/User.vue';

export default [
  { path: '/', name: 'TimeKeep', component: TimeKeep },
  { path: '/time-limit', name: 'TimeLimit', component: TimeLimit },
  { path: '/keyboard', name: 'Keyboard', component: TypingKeyboard },
  { path: '/user/:id', name: 'User', component: User }
];

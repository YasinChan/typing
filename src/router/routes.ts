import TimeLimit from '@/view/TimeLimit.vue';
import WordsLimit from '@/view/WordsLimit.vue';
import QuoteLimit from '@/view/QuoteLimit.vue';
import TypingKeyboard from '@/view/TypingKeyboard.vue';
import CustomPage from '@/view/CustomPage.vue';
import User from '@/view/User.vue';

export default [
  { path: '/', name: 'TimeLimit', component: TimeLimit },
  { path: '/words', name: 'WordsLimit', component: WordsLimit },
  { path: '/quote', name: 'QuoteLimit', component: QuoteLimit },
  { path: '/keyboard', name: 'TypingKeyboard', component: TypingKeyboard },
  { path: '/custom', name: 'Custom', component: CustomPage },
  { path: '/user/:id', name: 'User', component: User }
];

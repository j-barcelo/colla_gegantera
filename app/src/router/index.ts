import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuth } from '@shared/composables/useAuth';
import { getStoredToken } from '@shared/utils/api';
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/Tabs/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/home' },
      { path: 'home', component: () => import('@/views/Home/HomePage.vue') },
      { path: 'tab1', redirect: '/tabs/home' },
      { path: 'profile', component: () => import('@/views/Profile/ProfilePage.vue') },
    ],
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/AdminUsers/AdminUsersPage.vue'),
    meta: { requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const token = getStoredToken();
  const isPublicRoute = Boolean(to.meta.guestOnly);

  // Si no té token i intenta accedir a qualsevol ruta privada
  if (!token && !isPublicRoute) return next({ name: 'Login' });

  // Si ja té sessió iniciada i va a login o registre
  if (token && to.meta.guestOnly) return next('/tabs/home');

  // Si té sessió activa i no s'ha carregat l'usuari en memòria
  if (token && !isPublicRoute) {
    const { user, fetchUser } = useAuth();
    if (!user.value) {
      await fetchUser();
    }
  }

  // Si requereix permisos d'administrador
  if (to.meta.requiresAdmin) {
    const { user } = useAuth();
    if (user.value?.role !== 'admin') return next('/tabs/home');
  }

  next();
});

export default router;

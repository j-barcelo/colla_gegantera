import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuth } from '@shared/composables/useAuth';
import { getStoredToken } from '@shared/utils/api';
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/Tabs/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1',
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
      { path: '', redirect: '/tabs/tab1' },
      { path: 'tab1', component: () => import('@/views/Tab1Page.vue') },
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
  if (token && to.meta.guestOnly) return next('/tabs/tab1');

  // Si requereix permisos d'administrador
  if (to.meta.requiresAdmin) {
    const { user, fetchUser } = useAuth();
    let currentUser = user.value;
    currentUser ??= await fetchUser();

    if (currentUser?.role !== 'admin') return next('/tabs/tab1');
  }

  next();
});

export default router;

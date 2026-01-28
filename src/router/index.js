import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Login",
        component: () => import("../views/Login.vue"),
        meta: {
            title: "Login"
        }
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
        meta: {
            title: "Dashboard",
            requiresAuth: true
        }
    },
    {
        path: "/user/detail/:uid",
        name: "UserDetail",
        component: () => import("../views/UserDetail.vue"),
        meta: {
            title: "User Detail",
            requiresAuth: true
        }
    },
    {
        path: "/:catchAll(.*)*",
        name: "NotFound",
        component: () => import("../views/NotFound.vue"),
        meta: {
            title: "Not Found"
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} - CodePal`;
    
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isLoginPage = to.name === 'Login';
    
    if (requiresAuth && !isAuthenticated) {
        // Redirect to login if trying to access protected route without auth
        next({ name: 'Login' });
    } else if (isLoginPage && isAuthenticated) {
        // Redirect to dashboard if already authenticated and trying to access login
        next({ name: 'Dashboard' });
    } else {
        next();
    }
});

export default router;
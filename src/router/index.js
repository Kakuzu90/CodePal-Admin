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
            title: "Dashboard"
        }
    },
    {
        path: "/user/detail/:uid",
        name: "UserDetail",
        component: () => import("../views/UserDetail.vue"),
        meta: {
            title: "User Detail"
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
    next();
});

export default router;
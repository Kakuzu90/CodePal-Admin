<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useAuthentication from '../../composable/useAuthentication';

onMounted(() => {
    document.body.className = "nk-body bg-white npc-default has-aside";
});

const route = useRoute();
const { logout, getCurrentUser } = useAuthentication();
const currentUser = getCurrentUser();

const setActive = (name) => {
    const split = name.split("|");
    const isActive = split.some((name) => name === route.name);
    return isActive && "active";
}

const handleLogout = () => {
    logout();
}

</script>

<template>
    <div class="nk-main">
        <div class="nk-wrap">
            <div class="nk-header nk-header-fixed is-light">
                <div class="container-lg wide-xl">
                    <div class="nk-header-wrap">
                        <div class="nk-header-brand">
                            <RouterLink :to="{ name: 'Dashboard' }" class="logo-link">
                                <img src="/favicon.png" alt="CodePal" class="logo-dark logo-img">
                            </RouterLink>
                        </div>
                        <div class="nk-header-menu">
                            <ul class="nk-menu nk-menu-main">
                                <li class="nk-menu-item" :class="setActive('Dashboard')">
                                    <RouterLink :to="{ name: 'Dashboard' }" class="nk-menu-link">
                                        <span class="nk-menu-text">Dashboard</span>
                                    </RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div class="nk-header-tools">
                            <ul class="nk-quick-nav">
                                <li class="dropdown user-dropdown">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                        <div class="user-toggle">
                                            <div class="user-avatar sm">
                                                <vue-feather type="user" size="16" />
                                            </div>
                                            <div class="user-info d-none d-md-block">
                                                <div class="user-status">Administrator</div>
                                                <div class="user-name dropdown-indicator">{{ currentUser?.email || 'Admin' }}</div>
                                            </div>
                                        </div>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-md dropdown-menu-end dropdown-menu-s1">
                                        <div class="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
                                            <div class="user-card">
                                                <div class="user-avatar">
                                                    <vue-feather type="user" size="20" />
                                                </div>
                                                <div class="user-info">
                                                    <span class="lead-text">{{ currentUser?.email || 'Administrator' }}</span>
                                                    <span class="sub-text">admin@codepal.com</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="dropdown-inner">
                                            <ul class="link-list">
                                                <li>
                                                    <a href="#" @click.prevent="handleLogout">
                                                        <vue-feather type="log-out" size="16" />
                                                        <span>Sign out</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nk-content">
                <div class="container wide-xl">
                    <div class="nk-content-inner">
                        <div class="nk-content-body pt-0">
                            <div class="nk-content-wrap">
                                <slot />
                            </div>
                            <div class="nk-footer">
                                <div class="container wide-xl">
                                    <div class="nk-footer-wrap g-2">
                                        <div class="nk-footer-copyright">
                                            &copy; 2025 CodePal, All Rights Reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
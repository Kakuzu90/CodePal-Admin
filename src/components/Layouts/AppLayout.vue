<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

onMounted(() => {
    document.body.className = "nk-body bg-white npc-default has-aside";
});

const route = useRoute();

const setActive = (name) => {
    const split = name.split("|");
    const isActive = split.some((name) => name === route.name);
    return isActive && "active";
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
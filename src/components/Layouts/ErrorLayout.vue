<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    document.body.className = "nk-body bg-white npc-default pg-error";
});
</script>

<template>
    <div class="nk-main">
        <div class="nk-wrap nk-wrap-nosidebar">
            <div class="nk-content">
                <slot />
            </div>
        </div>
    </div>
</template>
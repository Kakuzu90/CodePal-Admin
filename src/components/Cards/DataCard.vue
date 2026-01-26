<script setup>
const props = defineProps(['type', 'count', 'icon']);
</script>

<template>
    <div class="card card-preview shadow-sm">
        <div class="card-inner d-flex justify-content-between align-items-center">
            <div>
                <h3 class="text-dark">{{ count }}</h3>
                <h6 class="fw-medium text-dark mb-0">Total {{ type }}</h6>
            </div>
            <vue-feather :type="icon" size="45" class="text-primary" />
        </div>
    </div>
</template>
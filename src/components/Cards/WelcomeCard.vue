<script setup>
import banner from '../../assets/images/banner-top.png';
import profile from '../../assets/images/administrator.jpg';
import useDate from '../../composable/useDate';

const { getCurrentDate } = useDate();
</script>

<template>
    <div class="card card-preview shadow-sm">
        <div class="card-inner p-0 rounded">
            <div class="position-relative">
                <div class="bg-primary-dim d-flex justify-content-between align-items-center">
                    <div class="pl-4">
                        <h4 class="fw-bolder text-primary mb-1">Welcome Back!</h4>
                        <p class="text-primary">CodePal Dashboard</p>
                    </div>
                    <img :src="banner" alt="Banner Image" width="200" height="110" />
                </div>
                <div class="position-absolute floating-avatar">
                    <div class="user-avatar bg-white p-1 md">
                        <img :src="profile" alt="Profile Logo" />
                    </div>
                </div>
            </div>
            <h4 class="card-date">
                {{ getCurrentDate }}
            </h4>
        </div>
    </div>
</template>
<style scoped>
.floating-avatar {
    bottom: -33px;
    left: 30px;
}
.card-date {
    margin-top: 35px;
    text-align: right;
    padding: 0 25px 25px 0;
}
</style>
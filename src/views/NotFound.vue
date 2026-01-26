<script setup>
import ErrorLayout from '../components/layouts/ErrorLayout.vue';
import error from "../assets/svg/error-404.svg";
</script>

<template>
    <ErrorLayout>
        <div class="nk-block nk-block-middle wide-md mx-auto">
            <div class="nk-block-content nk-error-ld text-center">
                <img :src="error" alt="Not Found" class="nk-error-gfx" />
                <div class="wide-xs mx-auto">
                    <h3 class="nk-error-title">Oops! Why you're here?</h3>
                    <p class="nk-error-text">
                        We are very sorry for inconvenience. It looks like you're trying to access a page that either has been deleted or never existed.
                    </p>
                    <RouterLink :to="{ name: 'Dashboard' }" class="btn btn-lg btn-primary mt-2">
                        Back to Home
                    </RouterLink>
                </div>
            </div>
        </div>
    </ErrorLayout>
</template>
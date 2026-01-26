import { computed, ref } from 'vue';

export default function useAuthentication() {
    const email = ref('');
    const password = ref('');
    const error = ref(false);
    const isSubmit = ref(false);
    const showPassword = ref(false);
    let timeout = null;

    const toggleShowPassword = () => {
        showPassword.value = !showPassword.value;
    }
    const icons = computed(() => showPassword.value ? 'eye-off' : 'eye');
    const passwordFieldType = computed(() => showPassword.value ? 'text' : 'password');

    const submitForm = () => {
        if (isSubmit.value) return;
        isSubmit.value = true;
        console.log('form submitted');

        timeout = setTimeout(() => {
            isSubmit.value = false;
        }, 1000);
    }

    return {
        email,
        password,
        error,
        isSubmit,
        toggleShowPassword,
        icons,
        passwordFieldType,
        submitForm
    }
}
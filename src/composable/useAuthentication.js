import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/auth';

export default function useAuthentication() {
    const router = useRouter();
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

    const login = (username, userPassword) => {
        return AuthService.login(username, userPassword);
    };

    const logout = () => {
        AuthService.logout();
        router.push('/');
    };

    const isAuthenticated = () => {
        return AuthService.isAuthenticated();
    };

    const getCurrentUser = () => {
        return AuthService.getCurrentUser();
    };

    const submitForm = () => {
        if (isSubmit.value) return;
        
        // Reset error state
        error.value = false;
        isSubmit.value = true;
        
        // Clear any existing timeout
        if (timeout) {
            clearTimeout(timeout);
        }
        
        // Simulate loading delay
        timeout = setTimeout(() => {
            const result = login(email.value, password.value);
            
            if (result.success) {
                // Navigate to dashboard on successful login
                router.push('/dashboard');
            } else {
                // Show error message
                error.value = true;
            }
            
            isSubmit.value = false;
        }, 1000);
    };

    return {
        email,
        password,
        error,
        isSubmit,
        toggleShowPassword,
        icons,
        passwordFieldType,
        submitForm,
        login,
        logout,
        isAuthenticated,
        getCurrentUser
    }
}
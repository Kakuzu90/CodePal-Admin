<script setup>
import useAuthentication from '../composable/useAuthentication';
import AuthLayout from './Layouts/AuthLayout.vue';

const {
    email, password, error, isSubmit, 
    toggleShowPassword, icons, passwordFieldType,
    submitForm
} = useAuthentication();

</script>

<template>
    <AuthLayout>
         <div class="nk-block nk-block-middle nk-auth-body wide-xs">
            <div class="card card-bordered">
                <div class="d-flex justify-content-between align-items-center bg-primary-dim p-3">
                    <div>
                        <h4 class="text-primary fw-bolder">Welcome Back!</h4>
                        <p class="fs-13px">Access your account using your email and password.</p>
                    </div>
                    <img src="/favicon.png" alt="CodePal" width="200" height="150" />
                </div>
                <div class="card-inner">
                    <h4 class="text-center fw-bold text-primary">CODE<span class="text-dark">PAL</span> Admin</h4>
                    <div class="mb-1">
                        <div class="form-label-group">
                            <label for="email" class="form-label">Email</label>
                        </div>
                        <input type="email" name="email" id="email"
                            v-model="email"
                            class="form-control"
                            placeholder="Enter your email address"
                            autofocus
                        />
                    </div>
                    <div class="form-group">
                        <div class="form-label-group">
                            <label for="password" class="form-label">Password</label>
                        </div>
                        <div class="form-control-wrap">
                            <a href="javascript:void(0);" class="form-icon form-icon-right" @click="toggleShowPassword">
                                <vue-feather :type="icons" size="14" class="passcode-icon icon-show icon" />
                            </a>
                            <input :type="passwordFieldType" name="password" id="password"
                                v-model="password"
                                class="form-control"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button 
                        type="button" class="btn btn-primary btn-lg btn-block"
                        :disabled="isSubmit"
                        @click="submitForm"
                    >
                        LOGIN
                    </button>

                    <p class="text-danger text-center mt-4" v-if="error">
                        <strong class="fw-bolder">Failed!</strong> The credentails you entered are incorrect.
                    </p>
                </div>
            </div>
        </div>
    </AuthLayout>
</template>
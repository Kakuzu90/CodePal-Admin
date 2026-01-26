<script setup>
import { toRef } from 'vue';
import useDataTable from '../../composable/useDataTable';

const props = defineProps({
    title: String,
    data: Array,
    searchable: Array,
    perPage: {
        type: Number,
        default: 10
    }
});

const {
    searchQuery,
    currentPage,
    paginatedData,
    totalPages,
    displayedPages,
    paginationInfo,
    nextPage,
    prevPage,
    goToPage
} = useDataTable({
    data: toRef(props, 'data'),
    searchable: props.searchable,
    perPage: props.perPage
});

</script>

<template>
    <div class="card card-preview shadow-sm">
        <div class="card-inner">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-4">
                <h5 class="card-title mb-0">{{ props.title }}</h5>
                <div class="d-flex justify-content-center align-items-center">
                    <div class="form-control-wrap ml-1">
                        <div class="form-icon form-icon-right">
                            <vue-feather type="search" size="15" />
                        </div>
                        <input type="text" name="search" class="form-control" v-model="searchQuery" placeholder="Search here..." />
                    </div>
                </div>
            </div>

            <div class="table-responsive-sm">
                <table class="nk-tb-list nk-tb-ulist text-center">
                    <thead>
                        <slot name="thead"></slot>
                    </thead>
                    <tbody>
                        <slot name="tbody" :data="paginatedData"></slot>
                    </tbody>
                </table>

                <div class="d-flex justify-content-between align-items-center mt-4">
                    <ul class="pagination">
                        <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                            <a href="#" class="page-link" @click.prevent="prevPage">Previous</a>
                        </li>
                        <li
                            v-for="pageNumber in displayedPages"
                            :key="pageNumber"
                            class="page-item"
                            :class="{ 'active': pageNumber === currentPage}"
                        >
                            <a href="#" class="page-link" @click.prevent="goToPage(pageNumber)">{{ pageNumber }}</a>
                        </li>
                        <li class="page-item" :class="{ 'disabled': currentPage === totalPages || totalPages === 0 }">
                            <a href="#" class="page-link" @click.prevent="nextPage">Next</a>
                        </li>
                    </ul>
                    <span class="text-dark">{{ paginationInfo }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
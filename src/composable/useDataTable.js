import { ref, computed, watch, unref } from 'vue';

export default function useDataTable({
    data,
    searchable = [],
    perPage = 15
}) {
    const searchQuery = ref('');
    const currentPage = ref(1);

    const filteredData= computed(() => {
        const source = unref(data) || [];

        if (!searchQuery.value) return source;

        const term = searchQuery.value.toLowerCase();
        currentPage.value = 1;

        return source.filter(item => 
            searchable.some(key => 
                String(item[key] ?? '').toLowerCase().includes(term)
            )
        )
    })

    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * perPage;
        const end = start + perPage;
        return filteredData.value.slice(start, end);
    })

    const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage));

    const displayedPages = computed(() => {
        const maxPages = 5;
        const total = totalPages.value;
        const current = currentPage.value;

        const half = Math.floor(maxPages / 2);
        let start = Math.max(1, current - half);
        let end = Math.min(start - maxPages -1, total);

        if (end - start < maxPages - 1) {
            start = Math.max(1, end - maxPages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })

    const paginationInfo = computed(() => {
        if (!filteredData.value.length) return '0 - 0 of 0';

        const start = (currentPage.value - 1) * perPage + 1;
        const end = Math.min(start + perPage - 1, filteredData.value.length);

        return `${start} - ${end} of ${filteredData.value.length}`;
    })

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value += 1;
        }
    }

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value -= 1;
        }
    }

    const gotoPage = (page) => {
        currentPage.value = page;
    }

    watch(data, () => {
        currentPage.value = 1;
    })

    return {
        searchQuery,
        currentPage,
        filteredData,
        paginatedData,
        totalPages,
        displayedPages,
        paginationInfo,
        nextPage,
        prevPage,
        gotoPage
    }
}
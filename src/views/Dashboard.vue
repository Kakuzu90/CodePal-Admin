<script setup>
import { ref } from 'vue';

import AppLayout from '../components/Layouts/AppLayout.vue';
import WelcomeCard from '../components/Cards/WelcomeCard.vue';
import DataCard from '../components/Cards/DataCard.vue';
import DataTable from '../components/Tables/DataTable.vue';

const searchable = ref(['name']);
const data = ref([]);

</script>

<template>
    <AppLayout>
        <div class="nk-block">
            <div class="row justify-content-center align-items-center g-4">
                <div class="col-lg-6">
                    <WelcomeCard />
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6 col-12">
                    <DataCard 
                        type="Users" 
                        count="1024" 
                        icon="users"
                    />
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6 col-12">
                    <DataCard 
                        type="Notes" 
                        count="256" 
                        icon="folder"
                    />
                </div>
            </div>
        </div>
        <div class="nk-block">
            <DataTable
                title="Lists of Users"
                :data="data"
                :searchable="searchable"
                :perPage="10"
            >
                <template v-slot:thead>
                    <tr class="nk-tb-item nk-tb-head">
                        <th class="nk-tb-col text-left">
                            <span class="sub-text">Username</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Password</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Total Notes</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Total Prompts</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Account Created</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Account Status</span>
                        </th>
                        <th class="nk-tb-col"></th>
                    </tr>
                </template>
                <template v-slot:tbody="slotProps">
                    <tr class="nk-tb-item" v-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="7">
                            <span>No data available</span>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>
    </AppLayout>
</template>
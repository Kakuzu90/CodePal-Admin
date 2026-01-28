<script setup>
import { ref } from 'vue';
import AppLayout from '../components/Layouts/AppLayout.vue';
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
                    <div class="card card-preview shadow-sm">
                        <div class="card-inner">
                            <h6>
                                Username: Username
                            </h6>
                            <h6>
                                Password: password
                            </h6>
                            <h6>
                                Account Created: 2024-01-01
                            </h6>
                            <h6>
                                Account Status: <span class="badge badge-warning">Suspended</span>
                            </h6>
                            <button type="button" class="btn btn-success">Active Account</button>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3">
                    <DataCard 
                        type="Notes" 
                        count="256" 
                        icon="file-text"
                    />
                </div>
                <div class="col-lg-3">
                    <DataCard 
                        type="Prompts" 
                        count="256" 
                        icon="list"
                    />
                </div>
            </div>
        </div>

        <div class="nk-block">
            <DataTable
                title="Lists of Notes"
                :data="data"
                :searchable="searchable"
                :perPage="10"
            >
                <template v-slot:thead>
                    <tr class="nk-tb-item nk-tb-head">
                        <th class="nk-tb-col text-left">
                            <span class="sub-text">Note Title</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Note Content</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Note Created</span>
                        </th>
                        <th class="nk-tb-col"></th>
                    </tr>
                </template>
                <template v-slot:tbody="slotProps">
                    <tr class="nk-tb-item" v-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="4">
                            <span>No data available</span>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>

        <div class="nk-block">
            <DataTable
                title="Lists of Prompts"
                :data="data"
                :searchable="searchable"
                :perPage="10"
            >
                <template v-slot:thead>
                    <tr class="nk-tb-item nk-tb-head">
                        <th class="nk-tb-col text-left">
                            <span class="sub-text">Prompt Title</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Prompt Created</span>
                        </th>
                        <th class="nk-tb-col"></th>
                    </tr>
                </template>
                <template v-slot:tbody="slotProps">
                    <tr class="nk-tb-item" v-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="3">
                            <span>No data available</span>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>

    </AppLayout>
</template>
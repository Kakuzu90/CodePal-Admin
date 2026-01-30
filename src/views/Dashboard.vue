<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/index.js';
import { useRouter } from 'vue-router';

import AppLayout from '../components/Layouts/AppLayout.vue';
import WelcomeCard from '../components/Cards/WelcomeCard.vue';
import DataCard from '../components/Cards/DataCard.vue';
import DataTable from '../components/Tables/DataTable.vue';

const searchable = ref(['username']);
const users = ref([]);
const loading = ref(false);
const error = ref(null);
const router = useRouter();

const showUser = (uid) => {
    router.push({ name: 'UserDetail', params: { uid: uid } });
}

// Computed properties for dashboard stats
const totalUsers = computed(() => users.value.length);
const totalNotes = computed(() => 
  users.value.reduce((sum, user) => sum + (user.notes?.length || 0), 0)
);

// Function to fetch all users data
const fetchUsersData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const usersQuery = query(collection(db, 'users'), orderBy('created_at', 'desc'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const usersData = await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Fetch user's notes
        try {
          const notesQuery = query(
            collection(db, `users/${userDoc.id}/notes`),
            orderBy('created_at', 'desc')
          );
          const notesSnapshot = await getDocs(notesQuery);
          userData.notes = notesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (notesError) {
          console.warn(`No notes found for user ${userDoc.id}`);
          userData.notes = [];
        }
        
        // Fetch user's chats
        try {
          const chatsQuery = query(
            collection(db, `users/${userDoc.id}/chats`),
            orderBy('created_at', 'desc')
          );
          const chatsSnapshot = await getDocs(chatsQuery);
          
          userData.chats = await Promise.all(
            chatsSnapshot.docs.map(async (chatDoc) => {
              const chatData = { id: chatDoc.id, ...chatDoc.data() };
   
              return chatData;
            })
          );
        } catch (chatsError) {
          console.warn(`No chats found for user ${userDoc.id}`);
          userData.chats = [];
        }
        
        return userData;
      })
    );
    
    users.value = usersData;
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching users data:', err);
  } finally {
    loading.value = false;
  }
};

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // Handle Firestore timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  
  // Handle regular Date
  return new Date(timestamp).toLocaleDateString();
};

// Transform data for DataTable
const data = computed(() => 
  users.value.map(user => ({
    id: user.id,
    username: user.username || 'N/A',
    password: user.password_text ? user.password_text : 'N/A',
    totalNotes: user.notes?.length || 0,
    totalPrompts: user.chats?.length || 0,
    accountCreated: formatDate(user.created_at),
    accountStatus: user.account_status == 0 ? 'Suspended' : user.account_status == 1 ? 'Active' : 'Unknown',
    name: user.username // For search functionality
  }))
);

onMounted(() => {
  fetchUsersData();
});

</script>

<template>
    <AppLayout>
        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger" role="alert">
            <strong>Error!</strong> {{ error }}
            <button @click="fetchUsersData" class="btn btn-sm btn-outline-danger ms-2">
                Retry
            </button>
        </div>

        <div class="nk-block">
            <div class="row justify-content-center align-items-center g-4">
                <div class="col-lg-6">
                    <WelcomeCard />
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6 col-12">
                    <DataCard 
                        type="Users" 
                        :count="loading ? '...' : totalUsers.toString()" 
                        icon="users"
                    />
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6 col-12">
                    <DataCard 
                        type="Notes" 
                        :count="loading ? '...' : totalNotes.toString()" 
                        icon="file-text"
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
                    <tr v-if="loading" class="nk-tb-item">
                        <td class="nk-tb-col" colspan="7">
                            <div class="d-flex justify-content-center align-items-center p-3">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden"></span>
                                </div>
                                <span class="ml-2">Loading users data...</span>
                            </div>
                        </td>
                    </tr>
                    <tr class="nk-tb-item" v-else-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="7">
                            <div class="text-center p-3">
                                <span>No users found</span>
                                <button @click="fetchUsersData" class="btn btn-sm btn-outline-primary ms-2">
                                    Refresh
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-else v-for="user in slotProps.data" :key="user.id" class="nk-tb-item">
                        <td class="nk-tb-col">
                            <div class="user-info">
                                <span class="tb-lead">{{ user.username }}</span>
                            </div>
                        </td>
                        <td class="nk-tb-col">
                            <span class="tb-sub">{{ user.password }}</span>
                        </td>
                        <td class="nk-tb-col">
                            <span class="badge badge-primary">{{ user.totalNotes }}</span>
                        </td>
                        <td class="nk-tb-col">
                            <span class="badge badge-success">{{ user.totalPrompts }}</span>
                        </td>
                        <td class="nk-tb-col">
                            <span class="tb-sub">{{ user.accountCreated }}</span>
                        </td>
                        <td class="nk-tb-col">
                            <span 
                                :class="`badge ${user.accountStatus === 'Active' ? 'badge-success' : 
                                         user.accountStatus === 'Suspended' ? 'badge-danger' : 'badge-secondary'}`"
                            >
                                {{ user.accountStatus }}
                            </span>
                        </td>
                        <td class="nk-tb-col align-middle">
                           <button 
                                type="button" 
                                class="btn btn-icon btn-outline-primary p-1"
                                @click="showUser(user.id)"
                            >
                            <vue-feather type="maximize" size="15" />
                           </button>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>
    </AppLayout>
</template>
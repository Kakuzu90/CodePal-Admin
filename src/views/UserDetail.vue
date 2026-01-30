<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/index.js';

// PrismJS imports for Python syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';

import AppLayout from '../components/Layouts/AppLayout.vue';
import DataCard from '../components/Cards/DataCard.vue';
import DataTable from '../components/Tables/DataTable.vue';

const route = useRoute();
const router = useRouter();

const searchableNotes = ref(['title', 'content']);
const searchableChats = ref(['title']);

const user = ref(null);
const userNotes = ref([]);
const userChats = ref([]);
const loading = ref(false);
const error = ref(null);
const updatingStatus = ref(false);

// Modal state
const showNoteModal = ref(false);
const selectedNote = ref(null);
const showChatModal = ref(false);
const selectedChat = ref(null);

// Computed properties for statistics
const totalNotes = computed(() => userNotes.value.length);
const totalPrompts = computed(() => userChats.value.length);

// Function to fetch user details
const fetchUserData = async (userId) => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch user basic info
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      error.value = 'User not found';
      return;
    }
    
    user.value = { id: userDoc.id, ...userDoc.data() };
    
    // Fetch user's notes
    await fetchUserNotes(userId);
    
    // Fetch user's chats
    await fetchUserChats(userId);
    
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching user data:', err);
  } finally {
    loading.value = false;
  }
};

// Function to fetch user notes
const fetchUserNotes = async (userId) => {
  try {
    const notesQuery = query(
      collection(db, `users/${userId}/notes`),
      orderBy('created_at', 'desc')
    );
    const notesSnapshot = await getDocs(notesQuery);
    userNotes.value = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.warn(`No notes found for user ${userId}`);
    userNotes.value = [];
  }
};

// Function to fetch user chats with conversations
const fetchUserChats = async (userId) => {
  try {
    const chatsRef = collection(db, `users/${userId}/chats`);
    const chatsSnapshot = await getDocs(chatsRef);
    
    if (chatsSnapshot.docs.length === 0) {
      console.log('No chats found, setting empty array');
      userChats.value = [];
      return;
    }
    
    userChats.value = await Promise.all(
      chatsSnapshot.docs.map(async (chatDoc) => {
        const chatData = { id: chatDoc.id, ...chatDoc.data() };
        
        // Try to fetch conversations without orderBy first
        try {
          const conversationsPath = `users/${userId}/chats/${chatDoc.id}/conversations`;
          
          const conversationsQuery = query(
            collection(db, conversationsPath),
            orderBy('created_at', 'asc')
          );
          const conversationsSnapshot = await getDocs(conversationsQuery);
          
          chatData.conversations = conversationsSnapshot.docs.map(doc => {
            const convData = { id: doc.id, ...doc.data() };
            return convData;
          });
          
        } catch (convError) {
          console.error(`Error fetching conversations for chat ${chatDoc.id}:`, convError);
          chatData.conversations = [];
        }
        
        return chatData;
      })
    );
    
  } catch (err) {
    console.error(`Error fetching chats for user ${userId}:`, err);
    userChats.value = [];
  }
};

// Function to update user account status
const updateAccountStatus = async (newStatus) => {
  if (!user.value) return;
  
  updatingStatus.value = true;
  try {
    newStatus = newStatus === 'active' ? 1 : 0;
    await updateDoc(doc(db, 'users', user.value.id), {
      account_status: newStatus
    });
    
    // Update local user data
    user.value.account_status = newStatus;
    
    // Show success message (you could add a toast notification here)
    console.log(`Account status updated to: ${newStatus}`);
  } catch (err) {
    error.value = `Failed to update account status: ${err.message}`;
    console.error('Error updating account status:', err);
  } finally {
    updatingStatus.value = false;
  }
};

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // Handle Firestore timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  
  // Handle regular Date
  return new Date(timestamp).toLocaleString();
};

// Format content preview
const formatContentPreview = (content, maxLength = 100) => {
  if (!content) return 'No content';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

// Transform notes data for DataTable
const notesData = computed(() => 
  userNotes.value.map(note => ({
    id: note.id,
    title: note.title || 'Untitled',
    content: note.content || '',
    contentPreview: formatContentPreview(note.content),
    created_at: note.created_at,
    name: note.title // For search functionality
  }))
);

// Transform chats data for DataTable
const chatsData = computed(() => 
  userChats.value.map(chat => ({
    id: chat.id,
    title: chat.title || 'Untitled Chat',
    created_at: chat.created_at,
    conversations: chat.conversations || [], // Keep for debugging
    name: chat.title // For search functionality
  }))
);

// Get status badge class
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 0: return 'badge badge-danger';
    case 1: return 'badge badge-success';
    case 2: return 'badge badge-danger';
    default: return 'badge badge-secondary';
  }
};

// Get next status for toggle button
const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case 0: return 'active';
    case 1: return 'suspended';
    default: return 'active';
  }
};

// Get toggle button text and class
const getToggleButtonProps = (currentStatus) => {
  const nextStatus = getNextStatus(currentStatus);
  return {
    text: nextStatus === 'active' ? 'Activate Account' : 'Suspend Account',
    class: nextStatus === 'active' ? 'btn btn-success' : 'btn btn-danger'
  };
};

// Check if content looks like Python code
const isPythonCode = (content) => {
  if (!content) return false;
  const pythonKeywords = [
    'def ', 'class ', 'import ', 'from ', 'if __name__', 'print(',
    'return ', 'elif ', 'else:', 'for ', 'while ', 'try:', 'except:',
    'with ', 'lambda ', 'yield ', 'async ', 'await ', 'self.'
  ];
  return pythonKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
};

// Highlight Python code
const highlightPythonCode = (code) => {
  if (!code) return 'No content';
  try {
    return Prism.highlight(code, Prism.languages.python, 'python');
  } catch (error) {
    console.warn('Failed to highlight code:', error);
    return code; // Return original code if highlighting fails
  }
};

// Modal functions
const viewNoteContent = (note) => {
  selectedNote.value = note;
  showNoteModal.value = true;
  
  // Highlight code after modal is shown
  nextTick(() => {
    const codeElement = document.getElementById('note-content-code');
    if (codeElement && isPythonCode(note.content)) {
      codeElement.innerHTML = highlightPythonCode(note.content);
    }
  });
};

const closeNoteModal = () => {
  showNoteModal.value = false;
  selectedNote.value = null;
};

// Copy to clipboard function
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const viewChatConversations = (chat) => {
  console.log('Opening chat modal for:', chat);
  selectedChat.value = chat;
  showChatModal.value = true;
  
  // Highlight code for type 3 conversations after modal is shown
  nextTick(() => {
    if (chat.conversations && chat.conversations.length > 0) {
      chat.conversations.forEach((conv, index) => {
        if (conv.type === 3) {
          const codeElement = document.getElementById(`chat-conversation-code-${index}`);
          if (codeElement && conv.content) {
            codeElement.innerHTML = highlightPythonCode(conv.content);
          }
        }
      });
    }
  });
};

const closeChatModal = () => {
  showChatModal.value = false;
  selectedChat.value = null;
};

// Get conversation type display info
const getConversationType = (type) => {
  switch (type) {
    case 1: return { label: 'User', class: 'badge-primary', icon: 'user' };
    case 2: return { label: 'Assistant', class: 'badge-success', icon: 'cpu' };
    case 3: return { label: 'Code', class: 'badge-info', icon: 'code' };
    default: return { label: 'Unknown', class: 'badge-secondary', icon: 'help' };
  }
};

// Watch for route changes
watch(() => route.params.uid, (newUserId) => {
  if (newUserId) {
    fetchUserData(newUserId);
  }
});

onMounted(() => {
  const userId = route.params.uid;
  if (userId) {
    fetchUserData(userId);
  } else {
    error.value = 'No user ID provided';
  }
});

</script>

<template>
    <AppLayout>
        <!-- Back Button -->
        <div class="nk-block-head nk-block-head-sm">
            <div class="nk-block-between">
                <div class="nk-block-head-content">
                    <h3 class="nk-block-title page-title">User Details</h3>
                    <div class="nk-block-des text-soft">
                        <button 
                            @click="router.push('/dashboard')" 
                            class="btn btn-outline-primary btn-sm"
                        >
                            <vue-feather type="arrow-left" size="15" class="mr-1" />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger" role="alert">
            <strong>Error!</strong> {{ error }}
            <button 
                v-if="route.params.uid" 
                @click="fetchUserData(route.params.uid)" 
                class="btn btn-sm btn-outline-danger ms-2"
            >
                Retry
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
            <span class="ml-2">Loading user details...</span>
        </div>

        <!-- User Details -->
        <div v-else-if="user" class="nk-block">
            <div class="row justify-content-center align-items-center g-4">
                <div class="col-lg-6">
                    <div class="card card-preview shadow-sm">
                        <div class="card-inner">
                            <div class="user-avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3">
                                <em class="icon ni ni-user fs-2"></em>
                            </div>
                            <h5 class="mb-3">User Information</h5>
                            <div class="row g-3">
                                <div class="col-12">
                                    <h6 class="text-muted mb-1">Username</h6>
                                    <p class="fw-bold">{{ user.username || 'N/A' }}</p>
                                </div>
                                <div class="col-12">
                                    <h6 class="text-muted mb-1">Password</h6>
                                    <p class="text-muted">{{ user.password_text ? user.password_text : 'N/A' }}</p>
                                </div>
                                <div class="col-12">
                                    <h6 class="text-muted mb-1">Account Created</h6>
                                    <p>{{ user.created_at }}</p>
                                </div>
                                <div class="col-12">
                                    <h6 class="text-muted mb-1">Account Status</h6>
                                    <span :class="getStatusBadgeClass(user.account_status)">
                                        {{ user.account_status == 1 ? 'Active' : 'Suspended' }}
                                    </span>
                                </div>
                                <div class="col-12 mt-4">
                                    <button 
                                        type="button" 
                                        :class="getToggleButtonProps(user.account_status).class"
                                        @click="updateAccountStatus(getNextStatus(user.account_status))"
                                        :disabled="updatingStatus"
                                    >
                                        {{ getToggleButtonProps(user.account_status).text }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3">
                    <DataCard 
                        type="Notes" 
                        :count="totalNotes.toString()" 
                        icon="file-text"
                    />
                </div>
                <div class="col-lg-3">
                    <DataCard 
                        type="Chat Prompts" 
                        :count="totalPrompts.toString()" 
                        icon="message-circle"
                    />
                </div>
            </div>
        </div>

        <!-- Notes Table -->
        <div v-if="user" class="nk-block">
            <DataTable
                title="User Notes"
                :data="notesData"
                :searchable="searchableNotes"
                :perPage="10"
            >
                <template v-slot:thead>
                    <tr class="nk-tb-item nk-tb-head">
                        <th class="nk-tb-col text-left">
                            <span class="sub-text">Note Title</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Content Preview</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Created Date</span>
                        </th>
                        <th class="nk-tb-col"></th>
                    </tr>
                </template>
                <template v-slot:tbody="slotProps">
                    <tr class="nk-tb-item" v-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="4">
                            <div class="text-center p-3">
                                <em class="icon ni ni-file-text text-muted fs-3"></em>
                                <p class="text-muted mt-2">No notes found for this user</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-else v-for="note in slotProps.data" :key="note.id" class="nk-tb-item">
                        <td class="nk-tb-col">
                            <div class="user-info">
                                <span class="tb-lead">{{ note.title }}</span>
                            </div>
                        </td>
                        <td class="nk-tb-col">
                            <span class="tb-sub text-truncate" style="max-width: 300px; display: block;">
                                {{ note.contentPreview }}
                            </span>
                        </td>
                        <td class="nk-tb-col">
                            <span class="tb-sub">{{ note.created_at }}</span>
                        </td>
                        <td class="nk-tb-col align-middle">
                           <button 
                                type="button" 
                                class="btn btn-icon btn-outline-primary p-1"
                                @click="viewNoteContent(note)"
                                title="View Note Content"
                            >
                            <vue-feather type="maximize" size="15" />
                           </button>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>

        <!-- Chats Table -->
        <div v-if="user" class="nk-block">
            <DataTable
                title="User Chat Prompts"
                :data="chatsData"
                :searchable="searchableChats"
                :perPage="10"
            >
                <template v-slot:thead>
                    <tr class="nk-tb-item nk-tb-head">
                        <th class="nk-tb-col text-left">
                            <span class="sub-text">Chat Title</span>
                        </th>
                        <th class="nk-tb-col">
                            <span class="sub-text">Created Date</span>
                        </th>
                        <th class="nk-tb-col"></th>
                    </tr>
                </template>
                <template v-slot:tbody="slotProps">
                    <tr class="nk-tb-item" v-if="slotProps.data.length === 0">
                        <td class="nk-tb-col" colspan="3">
                            <div class="text-center p-3">
                                <em class="icon ni ni-chat text-muted fs-3"></em>
                                <p class="text-muted mt-2">No chats found for this user</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-else v-for="chat in slotProps.data" :key="chat.id" class="nk-tb-item">
                        <td class="nk-tb-col">
                            <div class="user-info">
                                <span class="tb-lead">{{ chat.title }}</span>
                            </div>
                        </td>
                        <td class="nk-tb-col">
                            <span class="tb-sub">{{ chat.created_at }}</span>
                        </td>
                        <td class="nk-tb-col align-middle">
                            <button 
                                type="button" 
                                class="btn btn-icon btn-outline-primary p-1"
                                @click="viewChatConversations(chat)"
                            >
                            <vue-feather type="maximize" size="15" />
                           </button>
                        </td>
                    </tr>
                </template>
            </DataTable>
        </div>

        <!-- Note Content Modal -->
        <div v-if="showNoteModal" class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeNoteModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <em class="icon ni ni-file-text me-2"></em>
                            {{ selectedNote?.title || 'Note Content' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeNoteModal"></button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div v-if="selectedNote">
                            <div class="mb-3">
                                <small class="text-muted">
                                    <em class="icon ni ni-calendar me-1"></em>
                                    Created: {{ selectedNote.created_at }}
                                </small>
                            </div>
                            
                            <!-- Python Code Content -->
                            <div v-if="isPythonCode(selectedNote.content)" class="bg-dark text-light p-3 rounded">
                                <div class="d-flex justify-content-end align-items-center">
                                    <button class="btn btn-sm btn-outline-light" @click="copyToClipboard(selectedNote.content)">
                                        <em class="icon ni ni-copy me-1"></em> Copy
                                    </button>
                                </div>
                                <pre 
                                    id="note-content-code"
                                    class="language-python m-0" 
                                    style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; background: transparent; color: inherit;"
                                >{{ selectedNote.content }}</pre>
                            </div>
                            
                            <!-- Regular Text Content -->
                            <div v-else class="border rounded p-3" style="background-color: #f8f9fa;">
                                <div class="d-flex justify-content-end align-items-center">
                                    <button class="btn btn-sm btn-outline-primary" @click="copyToClipboard(selectedNote.content)">
                                        <em class="icon ni ni-copy me-1"></em> Copy
                                    </button>
                                </div>
                                <div style="white-space: pre-wrap; word-wrap: break-word; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
                                    {{ selectedNote.content }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeNoteModal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Conversations Modal -->
        <div v-if="showChatModal" class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeChatModal">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <em class="icon ni ni-chat me-2"></em>
                            {{ selectedChat?.title || 'Chat Conversations' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeChatModal"></button>
                    </div>
                    <div class="modal-body chat-container" style="max-height: 70vh; overflow-y: auto; padding: 0;">
                        <div v-if="selectedChat && selectedChat.conversations && selectedChat.conversations.length > 0" class="p-3">
                            <div 
                                v-for="(conversation, index) in selectedChat.conversations" 
                                :key="conversation.id || index" 
                                class="message-wrapper mb-3"
                                :class="conversation.type === 1 ? 'user-message' : 'assistant-message'"
                            >
                                <!-- Message Header -->
                                <div class="d-flex align-items-center mb-2">
                                    <div class="message-avatar mr-1">
                                        <span 
                                            :class="`badge ${getConversationType(conversation.type).class}`"
                                            style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
                                        >
                                            <em :class="`icon ni ni-${getConversationType(conversation.type).icon}`" style="font-size: 14px;"></em>
                                        </span>
                                    </div>
                                    <div class="message-info">
                                        <span class="fw-semibold">{{ getConversationType(conversation.type).label }}</span>
                                    </div>
                                </div>
                                
                                <!-- Message Content -->
                                <div 
                                    class="message-content p-3 rounded"
                                    :class="{
                                        'bg-light border': conversation.type === 1,
                                        'bg-primary text-white': conversation.type === 2,
                                        'bg-dark text-light': conversation.type === 3
                                    }"
                                >
                                    <!-- Type 3: Code Content with PrismJS -->
                                    <div v-if="conversation.type === 3">
                                        <pre 
                                            :id="`chat-conversation-code-${index}`"
                                            class="language-python m-0" 
                                            style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; background: transparent; color: inherit;"
                                        >{{ conversation.content || 'No content' }}</pre>
                                    </div>
                                    
                                    <!-- Type 1 & 2: Plain Text Content -->
                                    <div v-else>
                                        <div style="white-space: pre-wrap; word-wrap: break-word; line-height: 1.5;">
                                            {{ conversation.content || 'No content' }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Empty State -->
                        <div v-else class="text-center p-5">
                            <em class="icon ni ni-chat text-muted" style="font-size: 48px;"></em>
                            <h6 class="mt-3 text-muted">No conversations in this chat</h6>
                            <p class="text-muted">This chat doesn't have any messages yet.</p>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <span class="text-muted">
                                <em class="icon ni ni-message-circle me-1"></em>
                                {{ selectedChat?.conversations?.length || 0 }} messages
                            </span>
                            <button type="button" class="btn btn-primary" @click="closeChatModal">
                                Close Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </AppLayout>
</template>

<style scoped>
/* Modal animations */
.modal.show {
  animation: fadeIn 0.15s ease-out;
}

.modal-dialog {
  animation: slideIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Code content styling */
.modal-body pre {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #6c757d #f8f9fa;
}

.modal-body pre::-webkit-scrollbar {
  width: 8px;
}

.modal-body pre::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.modal-body pre::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 4px;
}

.modal-body pre::-webkit-scrollbar-thumb:hover {
  background: #495057;
}

/* Python code container styling */
.bg-dark {
  border: 1px solid #495057;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Text content container styling */
.border {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Copy button hover effect */
.btn-outline-light:hover,
.btn-outline-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Badge styling */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Modal content responsive */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .modal-body {
    max-height: 60vh;
  }
  
  .modal-body pre {
    font-size: 12px;
  }
}

/* Chat Modal Styles */
.chat-container {
  background: #f8f9fa;
}

.chat-messages {
  /* Remove max-height and overflow to prevent inner scrollbar */
}

.message-wrapper {
  max-width: 90%;
  animation: fadeInMessage 0.3s ease-out;
}

.user-message {
  margin-left: auto;
}

.assistant-message {
  margin-right: auto;
}

.message-content {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.message-content:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-avatar {
  flex-shrink: 0;
}

/* Message animations */
@keyframes fadeInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Code content in chat */
.message-content pre {
  /* Remove max-height to prevent code scrollbar - let modal body handle all scrolling */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
}

.message-content pre::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome/Safari */
}

/* Responsive chat modal */
@media (max-width: 992px) {
  .modal-xl {
    max-width: 95%;
  }
  
  .message-wrapper {
    max-width: 95%;
  }
}

@media (max-width: 576px) {
  .message-content {
    font-size: 14px;
  }
  
  .message-content pre {
    font-size: 12px;
  }
  
  .message-info {
    font-size: 13px;
  }
}
</style>
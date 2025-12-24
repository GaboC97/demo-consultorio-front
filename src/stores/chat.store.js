import { defineStore } from "pinia";
import { chatService } from "@/services/chat.service";

export const useChatStore = defineStore("chat", {
  state: () => ({
    inbox: [],
    activeConversationId: null,
    activeConversation: null,
    messages: [],
    loadingInbox: false,
    loadingMessages: false,
    sending: false,

    // polling
    pollInboxTimer: null,
    pollMessagesTimer: null,
  }),

  getters: {
    activeConversationUsers(state) {
      return state.activeConversation?.users ?? [];
    },
  },

  actions: {
    async fetchInbox() {
      this.loadingInbox = true;
      try {
        this.inbox = await chatService.getInbox();
      } finally {
        this.loadingInbox = false;
      }
    },

    async openConversation(conversationId) {
      this.activeConversationId = conversationId;
      this.loadingMessages = true;

      try {
        this.activeConversation = await chatService.getConversation(conversationId);
        this.messages = await chatService.getMessages(conversationId);

        // marcar leído al abrir
        await chatService.markConversationRead(conversationId);

        // refrescar inbox para sacar badges
        await this.fetchInbox();
      } finally {
        this.loadingMessages = false;
      }
    },

    async send(conversationId, text) {
      const body = (text ?? "").trim();
      if (!body) return;

      this.sending = true;
      try {
        // optimista: lo agregamos al toque (opcional)
        const temp = {
          id: `temp-${Date.now()}`,
          body,
          sender_id: "me",
          created_at: new Date().toISOString(),
          _optimistic: true,
        };
        this.messages.push(temp);

        const saved = await chatService.sendMessage(conversationId, body);

        // reemplazar el temp
        const idx = this.messages.findIndex((m) => m.id === temp.id);
        if (idx !== -1) this.messages[idx] = saved;

        // refrescar inbox (último mensaje/last_message_at)
        await this.fetchInbox();
      } finally {
        this.sending = false;
      }
    },

    // -------------------------
    // Polling
    // -------------------------
    startPolling() {
      this.stopPolling();

      // inbox cada 10s
      this.pollInboxTimer = setInterval(() => {
        this.fetchInbox();
      }, 10000);

      // mensajes de la conversación activa cada 3s
      this.pollMessagesTimer = setInterval(async () => {
        if (!this.activeConversationId) return;
        const msgs = await chatService.getMessages(this.activeConversationId);
        this.messages = msgs;
      }, 3000);
    },

    stopPolling() {
      if (this.pollInboxTimer) clearInterval(this.pollInboxTimer);
      if (this.pollMessagesTimer) clearInterval(this.pollMessagesTimer);
      this.pollInboxTimer = null;
      this.pollMessagesTimer = null;
    },
  },
});

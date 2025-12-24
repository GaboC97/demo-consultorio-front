import axios from "@/api/axios";

export const chatService = {
  // Conversations
  async getInbox() {
    const res = await axios.get("/conversations");
    return res.data.data;
  },

  async getOrCreateDirect(userId) {
    const res = await axios.post("/conversations", { user_id: userId });
    return res.data.data;
  },

  async getConversation(id) {
    const res = await axios.get(`/conversations/${id}`);
    return res.data.data;
  },

  async markConversationRead(conversationId) {
    await axios.post(`/conversations/${conversationId}/read`);
  },

  // Messages
  async getMessages(conversationId) {
    const res = await axios.get(`/conversations/${conversationId}/messages`);
    return res.data.data ?? res.data;
  },

  async sendMessage(conversationId, body) {
    const res = await axios.post(`/conversations/${conversationId}/messages`, { body });
    return res.data.data ?? res.data;
  },
};

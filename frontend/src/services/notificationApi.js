import api from "./api";

export const getNotifications = (page = 1, limit = 5) => {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const markAsRead = (id) => {
  return api.patch(`/notifications/read/${id}`);
};

export const markAllAsRead = () => {
  return api.patch(`/notifications/read-all`);
};

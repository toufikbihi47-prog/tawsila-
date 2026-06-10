import { User, Trip } from '../types';

export const getUsers = (): User[] => {
  const users = localStorage.getItem('app_users');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('app_users', JSON.stringify(users));
};

export const updateUserRating = (driverId: string, rating: number) => {
  const users = getUsers();
  const updatedUsers = users.map(user => {
    if (user.id === driverId) {
      const newCount = (user.ratingCount || 0) + 1;
      const newSum = (user.ratingSum || 0) + rating;
      return { ...user, ratingCount: newCount, ratingSum: newSum };
    }
    return user;
  });
  saveUsers(updatedUsers);
};

export const getTrips = (): Trip[] => {
  const trips = localStorage.getItem('app_trips');
  return trips ? JSON.parse(trips) : [];
};

export const saveTrips = (trips: Trip[]) => {
  localStorage.setItem('app_trips', JSON.stringify(trips));
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem('current_user');
  return u ? JSON.parse(u) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) localStorage.setItem('current_user', JSON.stringify(user));
  else localStorage.removeItem('current_user');
};

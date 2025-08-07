export const notificationsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [action.payload, ...state];
    case 'MARK_READ':
      return state.map(n => n.id === action.payload ? { ...n, read: true } : n);
    case 'REMOVE_NOTIFICATION':
      return state.filter(n => n.id !== action.payload);
    default:
      return state;
  }
};

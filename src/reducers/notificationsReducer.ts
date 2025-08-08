export const notificationsReducer = (state: any[], action: { type: any; payload: any; }) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [action.payload, ...state];
    case `'MARK_NOTIFICATION_READ'`:
      return state.map((n: { id: any; }) => n.id === action.payload ? { ...n, read: true } : n);
    case 'REMOVE_NOTIFICATION':
      return state.filter((n: { id: any; }) => n.id !== action.payload);
    default:
      return state;
  }
};

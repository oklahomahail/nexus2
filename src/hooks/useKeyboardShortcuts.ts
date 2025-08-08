import { useEffect } from 'react';

export const useKeyboardShortcuts = (dispatch: any, openModal: any) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
            break;
          case 'n':
            e.preventDefault();
            openModal('newCampaign');
            break;
          case 'd':
            e.preventDefault();
            dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
            break;
          case 't':
            e.preventDefault();
            dispatch({ type: 'TOGGLE_DARK_MODE' });
            break;
          default:
            break;
        }
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'HIDE_MODAL' });
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
        dispatch({ type: 'TOGGLE_CLAUDE_PANEL' });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch, openModal]);
};

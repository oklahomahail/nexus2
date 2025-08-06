import { AppState } from '../context/types';
import { useAppContext } from './useAppContext';

export const useSelector = <T>(selector: (state: AppState) => T): T => {
  const { state } = useAppContext();
  return selector(state);
};

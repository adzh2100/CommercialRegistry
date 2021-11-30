import { useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: any | undefined;
}

export function useAsyncAction<T>(
  action: (...params: any) => Promise<T>,
  initialState: AsyncState<T> = {
    data: undefined,
    error: undefined,
    loading: false
  }
) {
  const [state, setState] = useState<AsyncState<T>>(initialState);

  const idRef = useRef(0);

  async function perform (...params: any) {
      idRef.current += 1;
      const ourId = idRef.current;

      setState({ loading: true, data: undefined, error: undefined });

      try {
        const data = await action(...params);
        if (idRef.current === ourId) {
          setState({ loading: false, data, error: undefined });
        }
      } catch (error) {
        if (idRef.current === ourId) {
          setState({ loading: false, data: undefined, error });
        }
        throw error;
      }
    }

    async function trigger(...params: any) {
      perform(...params).catch(() => {
        //intentionally ignored
      });
    }

    useEffect(()=> {
      return () => {
        idRef.current += 1;
      }
    },[])
  return {
    ...state,
    trigger,
  }
}

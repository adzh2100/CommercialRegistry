import React, { DependencyList, useEffect } from 'react';
import { useAsyncAction } from './UseAsyncAction'

export function useAsync<T>(
  action: () => Promise<T>,
  dependencies: DependencyList
) {

  const { trigger, ...state} = useAsyncAction(action, {
    data: undefined,
    loading: true,
    error: undefined,
  });


  useEffect(()=> {
    trigger();
  }, dependencies);

  return { ...state, trigger };
}


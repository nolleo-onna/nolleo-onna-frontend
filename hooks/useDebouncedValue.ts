'use client';

import { useEffect, useState } from 'react';

/**
 * 입력이 멎은 뒤에만 값을 넘긴다.
 * 검색어를 서버 쿼리 키로 쓸 때 한 글자마다(한글은 자모 조합 단계마다) 요청이 나가지 않게 한다.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

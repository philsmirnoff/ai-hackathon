import { useEffect, useRef } from 'react';
import { Insight } from '../types';

export function useSSE(
  onInsight: (insight: Insight) => void,
  url: string = "/ws"
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const insight: Insight = JSON.parse(event.data);
          onInsight(insight);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        
        // Auto-retry after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      eventSource.onopen = () => {
        console.log('SSE connection established');
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, onInsight]);
}

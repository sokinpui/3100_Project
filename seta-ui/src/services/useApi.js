// services/useApi.js (Shared API Hook)
import { useContext } from 'react';
import ApiContext from './ApiContext';

// export default function useApi() {
//   const api = useContext(ApiContext);
//   return {
//     get: (endpoint) => api.get(endpoint),
//     post: (endpoint, data) => api.post(endpoint, data),
//     // Add other methods
//   };
// }

export default function useApi() {
  const api = useContext(ApiContext);
  return api;
}

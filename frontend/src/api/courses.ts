import apiClient from './index';

export const coursesAPI = {
  getAll: () => apiClient.get('/courses'),
  getById: (id: string) => apiClient.get(`/courses/${id}`),
  create: (data: any) => apiClient.post('/courses', data),
  update: (id: string, data: any) => apiClient.put(`/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
  getProgress: (id: string) => apiClient.get(`/courses/${id}/progress`),
  saveCode: (id: string, code: string) =>
    apiClient.post(`/courses/${id}/code`, {
      code,
      timestamp: new Date().toISOString(),
    }),

  /** 执行代码（返回文本输出和可选截图） */
  runCode: async (code: string): Promise<{ output: string; image?: string }> => {
  const res = await apiClient.post('/execute', { code });

  /* 把常见的 3 种形态统一成一个对象 */
  if ('output' in res) {
    // 拦截器直接返回 { output, image? }
    return res as { output: string; image?: string };
  }
  if (res?.data?.output) {
    // 拦截器返回 { data: { output, image? } }
    return res.data;
  }
  // axios 原始响应 → res.data 里才是真正的结果
  return res.data.data;
  },

};

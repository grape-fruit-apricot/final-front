import axios from 'axios'

// 서버 응답 형태는 { code, message, data } 이므로 성공 응답은 data만 꺼내서 반환한다.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.response.use((response) => response.data.data)

export default api

import axios from 'axios'

// 서버 응답 형태는 { code, message, data } 이므로 성공 응답은 data만 꺼내서 반환한다.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

axiosInstance.interceptors.response.use((response) => response.data.data)

export default axiosInstance

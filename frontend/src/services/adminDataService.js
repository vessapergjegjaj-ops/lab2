import api from './api'

const getData = response => response?.data?.data ?? []

const adminDataService = {
  search(resource, params) {
    return api.get(`/search/${resource}`, { params }).then(getData)
  },

  reports(params) {
    return api.get('/reports', { params }).then(getData)
  },

  exportUrl(resource, format) {
    const baseURL = api.defaults.baseURL.replace(/\/$/, '')
    return `${baseURL}/export/${resource}?format=${encodeURIComponent(format)}`
  },

  export(resource, format) {
    return api.get(`/export/${resource}`, {
      params: { format },
      responseType: 'blob',
    })
  },

  import(resource, records) {
    return api.post(`/import/${resource}`, { records }).then(getData)
  },
}

export default adminDataService

// 封装 sing-box / mihomo 的 clash_api (RESTful control API)
// 参考: https://github.com/MetaCubeX/mihomo/wiki/API

function getConfig() {
  return {
    host: localStorage.getItem('clash_host') || '127.0.0.1',
    port: localStorage.getItem('clash_port') || '9090',
    secret: localStorage.getItem('clash_secret') || ''
  }
}

function setConfig({ host, port, secret }) {
  if (host !== undefined) localStorage.setItem('clash_host', host)
  if (port !== undefined) localStorage.setItem('clash_port', port)
  if (secret !== undefined) localStorage.setItem('clash_secret', secret)
}

function baseUrl() {
  const { host, port } = getConfig()
  return `http://${host}:${port}`
}

function wsUrl(path) {
  const { host, port, secret } = getConfig()
  const token = secret ? `?token=${encodeURIComponent(secret)}` : ''
  return `ws://${host}:${port}${path}${token}`
}

async function request(path, options = {}) {
  const { secret } = getConfig()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (secret) headers['Authorization'] = `Bearer ${secret}`
  const res = await fetch(baseUrl() + path, { ...options, headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  // 部分接口(如 PUT /configs)成功时返回空 body
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const clashApi = {
  getConfig,
  setConfig,
  wsUrl,

  // 版本/连通性检测
  version: () => request('/version'),

  // 代理组 & 节点
  getProxies: () => request('/proxies'),
  getProxy: (name) => request(`/proxies/${encodeURIComponent(name)}`),
  selectProxy: (group, name) =>
    request(`/proxies/${encodeURIComponent(group)}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    }),
  testProxyDelay: (name, testUrl = 'https://cp.cloudflare.com', timeout = 5000) =>
    request(
      `/proxies/${encodeURIComponent(name)}/delay?timeout=${timeout}&url=${encodeURIComponent(testUrl)}`
    ),

  // 规则
  getRules: () => request('/rules'),

  // 连接管理
  getConnections: () => request('/connections'),
  closeConnection: (id) => request(`/connections/${id}`, { method: 'DELETE' }),
  closeAllConnections: () => request('/connections', { method: 'DELETE' }),

  // 运行模式(rule/global/direct)与配置
  getConfigs: () => request('/configs'),
  setMode: (mode) =>
    request('/configs', { method: 'PATCH', body: JSON.stringify({ mode }) }),
  reloadConfig: (force = false) =>
    request(`/configs?force=${force}`, { method: 'PUT', body: JSON.stringify({}) }),

  // WebSocket 流(实时流量 / 连接 / 日志)
  streamTraffic: (onMessage, onError) => connectWs('/traffic', onMessage, onError),
  streamConnections: (onMessage, onError) => connectWs('/connections', onMessage, onError),
  streamLogs: (onMessage, onError, level = 'info') =>
    connectWs(`/logs?level=${level}`, onMessage, onError)
}

function connectWs(path, onMessage, onError) {
  const ws = new WebSocket(wsUrl(path))
  ws.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(ev.data))
    } catch (e) {
      /* ignore malformed frame */
    }
  }
  ws.onerror = (ev) => onError && onError(ev)
  return ws // 调用方负责在组件卸载时 ws.close()
}

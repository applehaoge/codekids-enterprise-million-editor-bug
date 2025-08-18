let ws = null
const listeners = new Map()
let reconnectAttempts = 0
const reconnectMsInitial = 1000
const reconnectMsMax = 30000
const heartbeatInterval = 30000
let heartbeatTimer = null
const connectTimeoutMs = Number(import.meta.env.VITE_WS_CONNECT_TIMEOUT || 8000)
function scheduleReconnect(){ reconnectAttempts++
  const backoff = Math.min(reconnectMsInitial * (2 ** (reconnectAttempts - 1)), reconnectMsMax)
  const jitter = Math.floor(Math.random() * Math.max(100, Math.floor(backoff * 0.1)))
  const wait = backoff + jitter
  setTimeout(()=>{ connect().catch(()=>{}) }, wait)
}
export function connect(){
  return new Promise((resolve, reject) => {
    if(ws && ws.readyState === WebSocket.OPEN) return resolve()
    const defaultPath = import.meta.env.VITE_WS_PATH || '/ws'
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const defaultUrl = `${protocol}://${location.host}${defaultPath}`
    const url = import.meta.env.VITE_WS_URL || defaultUrl
    let settled = false
    try{
      ws = new WebSocket(url)
      const timer = setTimeout(()=>{
        if(settled) return
        settled = true
        try{ if(ws) ws.close() }catch(e){}
        scheduleReconnect()
        reject(new Error('WS connect timeout'))
      }, connectTimeoutMs)
      ws.onopen = () => {
        if(settled) return
        settled = true
        clearTimeout(timer)
        reconnectAttempts = 0
        startHeartbeat()
        resolve()
      }
      ws.onmessage = (e) => {
        try{ const msg = JSON.parse(e.data)
          const handlers = listeners.get(msg.type) || []
          handlers.forEach(h=>h(msg.payload))
        }catch(err){}
      }
      ws.onclose = () => {
        stopHeartbeat()
        if(!settled){ settled = true; reject(new Error('WS closed before open')) }
        scheduleReconnect()
      }
      ws.onerror = () => {}
    }catch(e){ scheduleReconnect(); reject(e) }
  })
}
export function send(type, payload){ if(ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type,payload,ts:Date.now()})) }
export function on(type, handler){
  const arr = listeners.get(type) || []
  arr.push(handler)
  listeners.set(type, arr)
  return () => {
    const cur = listeners.get(type) || []
    listeners.set(type, cur.filter(h=>h!==handler))
  }
}
export function close(code, reason){ if(ws) ws.close(code, reason); ws = null }
function startHeartbeat(){ if(heartbeatTimer) clearInterval(heartbeatTimer); heartbeatTimer = setInterval(()=>{ try{ if(ws && ws.readyState===WebSocket.OPEN){ ws.send(JSON.stringify({type:'__ping',ts:Date.now()})) } }catch(e){} }, heartbeatInterval) }
function stopHeartbeat(){ if(heartbeatTimer) clearInterval(heartbeatTimer); heartbeatTimer = null }
export default { connect, send, on, close }

let ws = null
const listeners = new Map()
let reconnectMs = 2000
let heartbeatInterval = 30000
let heartbeatTimer = null
export function connect(){
  return new Promise((resolve, reject) => {
    if(ws && ws.readyState === WebSocket.OPEN) return resolve()
    const url = import.meta.env.VITE_WS_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${import.meta.env.VITE_WS_HOST || 'localhost'}:${import.meta.env.VITE_WS_PORT || 8081}${import.meta.env.VITE_WS_PATH || '/api/ws'}`
    ws = new WebSocket(url)
    ws.onopen = () => {
      console.log('WS Connected')
      startHeartbeat()
      resolve()
    }
    ws.onmessage = (e) => {
      try{ const msg = JSON.parse(e.data)
        const handlers = listeners.get(msg.type) || []
        handlers.forEach(h=>h(msg.payload))
      }catch(err){ console.error(err) }
    }
    ws.onclose = () => {
      stopHeartbeat()
      setTimeout(() => connect(), reconnectMs)
    }
    ws.onerror = (e) => console.error('WS error', e)
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
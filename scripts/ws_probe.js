const WebSocket = require('ws');
function probe(url, label, timeout = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    try {
      const s = new WebSocket(url);
      const finish = (type, info) => {
        if (settled) return;
        settled = true;
        try { s.close(); } catch (e) {}
        console.log(type, label, info || '');
        resolve({type, info});
      };
      s.on('open', () => finish('OPEN'));
      s.on('unexpected-response', (req, res) => finish('UNEXPECTED', res.statusCode));
      s.on('error', (e) => finish('ERROR', e.message));
      setTimeout(() => finish('TIMEOUT'), timeout);
    } catch (e) {
      if (!settled) {
        settled = true;
        console.log('FAIL', label, e.message);
        resolve({type: 'FAIL', info: e.message});
      }
    }
  });
}

(async () => {
  await probe('ws://localhost:8081/api/ws', '8081');
  await probe('ws://localhost:5173/ws', '5173');
})();

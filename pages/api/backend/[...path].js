/**
 * Proxy requests to the backend in dev mode.
 */

import {createProxyMiddleware} from 'http-proxy-middleware'

const dev = process.env.NODE_ENV == 'development'
const proxy = dev
  ? createProxyMiddleware({
      target: process.env.NEXT_PUBLIC_BACKEND_PROXY_URL,
      changeOrigin: true,
      pathRewrite: {'^/api/backend': ''},
      autoRewrite: true
    })
  : null

export const config = {
  api: {
    bodyParser: false // don't try to parse the body, it could be some binary blob
  }
}

// https://nextjs.org/docs/api-routes/api-middlewares
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result)
      else return resolve(result)
    })
  })
}

async function handler(req, res) {
  if (dev) {
    await runMiddleware(req, res, proxy)
    res.end()
  } else {
    res.status(400) // since this request came in production, don't give any information other than a 400
  }
}

export default handler

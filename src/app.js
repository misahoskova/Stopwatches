import https from 'https'

const username = 'martin.poupa'
const password = 'vedxom-2torhi-miFrut'

async function getResponse(url, options) {
  const response = await new Promise((resolve, reject) => {
    https
      .get(url, options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      })
      .on('error', (error) => {
        reject(error)
      })
  })
  return JSON.parse(response)
}

async function postResponse(options, body) {
  const response = await new Promise((resolve, reject) => {
    const req = https
      .request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      })
      .on('error', (error) => {
        reject(error)
      })

    req.write(body, 'utf8')
    req.end()
  })
  return JSON.parse(response)
}

export async function getData(hostname, company, path) {
  try {
    const options = {
      auth: `${username}:${password}`,
    }
    const url = `https://${hostname}/c/${company}${path}`
    const data = await getResponse(url, options)
    return data
  } catch (error) {
    console.error('Error getting data:', error)
  }
}

export async function sendData(hostname, company, path, jsonData) {
  try {
    const options = {
      hostname: hostname,
      port: 443,
      path: `/c/${company}${path}`,
      method: 'POST',
      auth: `${username}:${password}`,
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        'Content-Length': JSON.stringify(jsonData).length,
        Accept: '*/*',
        'User-Agent': 'Node.js',
      },
    }

    const response = await postResponse(options, JSON.stringify(jsonData))
    console.log('send:', response.winstrom.success)
    console.log('response:', response)
    console.log(JSON.stringify(jsonData))
  } catch (error) {
    console.error('Error sending data:', error)
  }
}

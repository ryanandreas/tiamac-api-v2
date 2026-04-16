import { getServiceDetail } from './app/actions/booking'

async function test() {
  const result = await getServiceDetail('#5A5AAC2C')
  console.log('Action Result:', JSON.stringify(result, null, 2))
}

test().catch(console.error)

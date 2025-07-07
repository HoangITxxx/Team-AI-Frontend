// // wagmi.config.ts
// import { defineConfig } from '@wagmi/cli'
// import { react } from '@wagmi/cli/plugins'
// import * as VisitorAnalyticsLogic from './lib/abi/VisitorAnalyticsLogic.abi.json'

// export default defineConfig({
//   out: 'lib/generated.ts', // File output
//   contracts: [
//     {
//       name: 'VisitorAnalyticsLogic',
//       abi: VisitorAnalyticsLogic.abi, // Lấy ABI từ file JSON
//     },
//   ],
//   plugins: [react()],
// })
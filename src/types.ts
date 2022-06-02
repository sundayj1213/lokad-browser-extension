interface Message {
  id: 'ping' | 'subscribe' | 'subscribed' | 'publish' | 'published'
  topic?: string
  payload?: any
  focus?: true
}

interface Subscription {
  id: number | undefined
  createdAt: number
}

interface ExtResponse {
  id: 'pong' | '_subscribe' | '_subscribed' | '_publish' | '_published'
  tab?: browser.tabs.Tab
  topic?: string | undefined
  payload?: any,
  focus?: true
  subscribers?: Subscription[]
}
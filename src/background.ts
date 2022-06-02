// listen to message from content script
browser.runtime.onMessage.addListener((message: Message) => {

  // respond only if content script is available
  browser.tabs.query({active: true, currentWindow: true})
    .then(async (tabs: browser.tabs.Tab[]) => {
      // initialize response
      let response: ExtResponse;
      // get first item from current tabs
      let [currentTab] = tabs;
      
      // handle messsage based on id
      switch (message.id) {
        case 'ping':
            response = {id: 'pong'};
          break;
        case 'subscribe':
            response = {
              'id': '_subscribe',
              tab: currentTab,
              topic: message.topic,
            };
          break;
        case 'publish':
            response = {
              id: '_publish',
              tab: currentTab,
              topic: message.topic,
              payload: message.payload,
              focus: message.focus
            }
          break;
        case 'published':
            response = {
              id: '_published',
              tab: currentTab,
              topic: message.topic,
              subscribers: await fetchTopicPublishers(message, currentTab)
            }
            console.log(response);
          break;
        case 'subscribed':
            response = {
              id: '_subscribed',
              tab: currentTab,
              topic: message.topic,
              subscribers: await fetchTopicSubscribers(message.topic, currentTab)
            };
          break;
      }

      // if has no response or tab id, abort
      if(!response || !currentTab.id) return;

      // send message to cntent script
      browser.tabs.sendMessage(currentTab.id, response);
    });
});

/**
 * Publish callback to topic listeners
 * @param {any} message
 * @param {browser.tabs.Tab} currentTab
 * @returns 
 */
async function fetchTopicPublishers(message: any, currentTab: browser.tabs.Tab) {
  // hold all topic data
  const result = [];
  // get tabs in same domain
  const tabs = await getTabsInSameDomain(currentTab);
  // format payload
  const payload = {
    'id': '_publishers',
    tab: currentTab,
    topic: message.topic,
    payload: message.payload,
  };

  const promises: any = tabs.filter(tab => !!tab.id)
    .map((tab) => {
      return {tab, promise: sendMessagePromise(tab.id, payload)};
    });

  for (let {tab, promise} of promises) {
    
    // if tab.id missing, skip
    if(!tab.id) continue;

    const [response] = await promise;

    // if is subscribed to topic, push
    if(response && response.id && response.id != currentTab.id) {
      // send payload to tabs with topic to listening tabs
      browser.tabs.sendMessage(tab.id, {
        id: '_subscription_trigger',
        topic: message.topic,
        payload: message.payload
      });

      // push listening tabs
      result.push(response);
    }
  }

  // focus on oldest tab
  if(message.focus) {
    await focusOnOldestTab(result);
  }

  // return tabs subscribed to topic
  return result;
}

/**
 * Focus on oldest tab
 * @param {Subscription[]} subscriptions
 * @returns 
 */
async function focusOnOldestTab(subscriptions: Subscription[]) {
  // get oldest tab
  const oldestTab = subscriptions.reduce(
    (r: any, o: any) => o.createdAt && r.createdAt 
      && o.createdAt < r.createdAt? o : r
  );  

  // if is missing id, skip
  if(!oldestTab.id) return;
  
  // focus on tab
  browser.tabs.update(oldestTab.id, {
    active: true
  });
}

/**
 * Fetch content scripts subscribed to a given topic
 * @param {string} topic
 * @param {browser.tabs.Tab} currentTab
 * @returns {any}
 */
async function fetchTopicSubscribers(topic: any, currentTab: browser.tabs.Tab) {
  const result = [];
  const tabs = await getTabsInSameDomain(currentTab);

  const promises: any = tabs
    .filter(tab => !!tab.id)
    .map((tab) => {
      return {tab, promise: sendMessagePromise(tab.id, topic)};
    });

  for (let {tab, promise} of promises) {

    // if tab.id missing, skip
    if(!tab.id) continue;

    const response= await promise;
    
      // if is subscribed to topic, push
    if(response.length) {
      result.push(tab);
    }
  }

  // return tabs subscribed to topic
  return result;
}

/**
 * Get tabs in same domain
 * @param {browser.tabs.Tab} currentTab
 * @returns {Array}
 */
async function getTabsInSameDomain(currentTab: browser.tabs.Tab)
{
  // holds array of all tabs
  const result = [];
  // query all tabs
  const tabs = await browser.tabs.query({});

  for(var tab of tabs) {

    // if any of these properties are missing, skip
    if(!tab.id || !tab.url || !currentTab.url) continue;

    if(new URL(currentTab.url).hostname == new URL(tab.url).hostname) {
      result.push(tab);
    }
  }

  // return tabs in same domain
  return result;
}

/**
 * Promise wrapper for chrome.tabs.sendMessage
 * @param {number} tabId
 * @param {any} item
 * @returns {Promise<Array>}
 */
async function sendMessagePromise(tabId: number | undefined, message: any): Promise<any>
{
  return new Promise((resolve, reject) => {
    if(tabId) {
      browser.tabs.sendMessage(tabId, message) 
      .then((response: any) => {

        // return data
        if(response && response.complete) {
          resolve(response.data);
        } 

        // if no response after 10s, return empty
        setTimeout(() => resolve([]), 10000);
      });
    } else resolve([]);
  });
}
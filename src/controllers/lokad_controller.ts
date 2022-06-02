export class LokadController {
  /**
   * Create Subscription to topic
   * @param {string} topic
   * @returns {void}
   */
  async subscribe(topic: string, currentTab: browser.tabs.Tab | undefined) { 
    // get previous subscribers
    let subscribers: Subscription[] = JSON.parse(sessionStorage.getItem(topic)??'[]');
    // format sunscriber
    let subscriber: Subscription = {
      id: currentTab ? currentTab.id: undefined,
      createdAt: (new Date()).getTime()
    };
      
    if(!subscribers.length) {
      subscribers = [subscriber];
    } else {
      // if tab doesn not exists, push
      if(
        !subscribers.some((i:any) => i.id == subscriber.id)
      ) 
      {
        subscribers.push(subscriber);
      }
    }

    // update topic subscribers
    sessionStorage.setItem(topic, JSON.stringify(subscribers));

    // return response
    return browser.runtime.sendMessage({
      id: 'subscribed',
      topic
    });
  }

  /**
   * Get topic subscriptions
   * @param topic 
   * @returns {any}
   */
  fetchSubscribers(topic: string, sendResponse: any) {
    // format result
    const result = { 
      data: JSON.parse(sessionStorage.getItem(topic)??'[]'),
      complete: true
    };

    // send response to sender
    sendResponse(result);

    // return result
    return result;
  }

  /**
   * Publish topi backend
   * @param {string} topic
   * @returns {void}
   */
  publish(topic: any, payload: any, focus: any) { 
    // return response
    return browser.runtime.sendMessage({
      id: 'published',
      topic,
      payload,
      focus
    });
  }

  /**
   * Publish Subscription topic with message
   * @param {string} message
   * @param {any} sendResponse
   * @returns {void}
   */
  fetchPublishers(message: any, sendResponse: any) { 
    // default data 
    const result = {
      complete: true,
      data: JSON.parse(sessionStorage.getItem(message.topic)??'[]'),
    };

    // check if empty
    if(result.data.length) {
      // get subscription with tab id
      const subscription = result.data.find((i: any) => i.id == message.tab.id);

      // check if current tab has topic subscription
      if(subscription) {
        // update data
        result.data = [subscription];
        // send payload to current tab with topic
        window.postMessage({
          id: '_subscription_trigger',
          topic: message.topic,
          payload: message.payload
        }, '*');
      }
    };
    
    // send response to sender
    sendResponse(result);

    // return result
    return result;
  }
}

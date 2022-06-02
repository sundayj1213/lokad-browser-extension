class LokadExtApp {
  /**
   * Pings the background string
   * @returns {void}
   */
  pingExtension() {
      setTimeout(() => {
          // ping background script
          window.postMessage({id: 'ping'}, '*');

          // if enabled or timeoutskip prevent next iteration
          if(this.enabled || this.timedout) return;

          // ping again
          this.pingExtension();
      }, 500);
  }

  /**
   * A function that returns true if the add-on is available, and false otherwise.
   * @returns {Promise<boolean>}
   */
  async isEnabled()
  {
      return new Promise((resolve, reject) => {
          // ping background
         this.pingExtension();

          // listen for response
          window.addEventListener('message', (message) => {
              /**
               * data = {
               * id: string,
               * tab: window.tabs.Tab,
               * topic: string,
               * subscribers: browser.tab.Tabs[]
               * }
              */
              const { data } = message;
              if(data.id == 'pong') {
                  return resolve(this.enabled = !0);
              }
          });

          // consider disabled after 10s
          setTimeout(() => {
              this.timedout = !0,
              resolve(this.enabled = !1);
          }, 10000);
      })
  }

  /**
   * Used by a page to subscribe to a topic, given that topic’s identifier.
   * Whenever a message is published on that topic, the provided callback
   * onMessage will be invoked on the contents of that message.
   * The function returns true if it is the only page subscribed to that topic.
   * @param {string} topic
   * @param {Function} onMessage
   * @returns {Promise<boolean>}
   */
  async subscribe(topic, onMessage)
  {
      return !this.enabled ? !1: new Promise((resolve, reject) => {
          // subscribe
          window.postMessage({
              id: 'subscribe',
              topic
          }, '*');
          // listen for response
          window.addEventListener('message', (message) => {
              // get message data
              /**
               * data = {
               * id: string,
               * tab: window.tabs.Tab,
               * topic: string,
               * subscribers: browser.tab.Tabs[]
               * }
              */
              const { data } = message;

              // if id is subscribe && topic is topic
              if(data.id == '_subscribed' && data.topic == topic) {
                  // check if total is 1
                  resolve(data.subscribers.length === 1);
              }

              // if id is publish && topic is topic
              if(data.id == '_subscription_trigger' && data.topic == topic) {
                  // run callback
                  onMessage(data.payload);
              }
          });

          // consider disabled after 10s
          setTimeout(() => resolve(false), 10000);
      });
  }

  /**
   * Used by a page to publish a message on a topic, given that topic’s
   * identifier. This causes the onMessage callbacks registerd with that
   * topic to be invoked on the provided message. If focus is true, then
   * the tab containing the page with the oldest subscription to that
   * topic will gain focus. The function returns true if at least one page
   * was subscribed to the topic.
   * @param {string} topic
   * @param {message} any
   * @param {boolean} focus
   * @returns {Promise<boolean>}
   */
  async publish(topic, payload, focus = false) {
      return !this.enabled ? !1: new Promise((resolve, reject) => {
          // publish
          window.postMessage({
              id: 'publish',
              topic,
              payload,
              focus
          }, '*');

          // listen for response
          window.addEventListener('message', (message) => {
              // get message data
              /**
               * data = {
               * id: string,
               * tab: window.tabs.Tab,
               * topic: string,
               * subscribers: browser.tab.Tabs[]
               * }
              */
              const { data } = message;

              // if id is topic
              if(data.id == '_published' && data.topic == topic) {
                  // check if total is 1
                  resolve(data.subscribers.length >= 1);
              }
          });

          // considered disabled after 10s
          setTimeout(() => resolve(false), 10000);
      });
  }
}

window.LokadExtApp = new LokadExtApp;

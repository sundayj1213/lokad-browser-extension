import { LokadController } from '../controllers/lokad_controller';

const lokadController = new LokadController();

// /Get message from background page
browser.runtime.onMessage.addListener(async (message: any, sender: browser.runtime.MessageSender, sendResponse) => {
  // response for sendReponse to function
  let response;

  switch (message.id) {
    case '_subscribe': 
        response = await lokadController.subscribe(message.topic, message.tab);
      break;
    case '_publish': 
      response = await lokadController.publish(message.topic, message.payload, message.focus);
      break;
    case '_subscribers':
        response = lokadController.fetchSubscribers(message.topic, sendResponse);
      break;
    case '_publishers':
        response = lokadController.fetchPublishers(message, sendResponse);          
      break;
    default:
      window.postMessage(message, '*');
  }

  return response;
});



// forwards message to background script
window.addEventListener('message', (event: MessageEvent<any>) => {

  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }
  
  browser.runtime.sendMessage(event.data);
});

const {PersonalizeEvents} = require('./aws-sdk-2.1107.0.js');
const personalizeevents = new PersonalizeEvents({
  apiVersion: '2018-03-22',
  region: 'us-east-1'
});
const trackingId = 'adef01ab-2ec5-41b6-baf5-d33489a787ac';

const personalizePreview =(orderId, userId, sessionId, items) => {
  return new Promise((resolve, reject) => {
    const params = {
      eventList: items.map(item => {
        return {
          eventType: 'preview',
          sentAt: new Date().getTime(),
          itemId: item.itemId.toString(),
          properties: {
            orderId: orderId,
            itemName: item.name,
            itemQuantity: 1
          },
        };
      }),
      sessionId,
      trackingId,
      userId
    };
    personalizeevents.putEvents(params, (err, data) => {
      if (err) reject(err, err.stack);
      else resolve(data);
    });
  });
}

export default personalizePreview
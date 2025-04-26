const fs = require("fs");

const checkAndCreateFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};




const WebSocket = require('ws');
const webSocketNotifications = async function (notification) {
    const {getServerAndWss} = require('../server')
    const serverWss = await getServerAndWss()
    if (serverWss.server) {
        console.log('Server is listening...');
        const wss = serverWss.wss
        const notificationsToSend = JSON.stringify({notification});
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {

                try {
                    client.send(notificationsToSend);
                } catch (error) {
                    console.error('Error sending WebSocket notification:', error);
                }
            }
        });
    }
};


module.exports = { checkAndCreateFolder ,webSocketNotifications};

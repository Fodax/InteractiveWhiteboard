import { Alert } from 'react-native';

class Sender {
    constructor(address, onMessage) {
        this.socket = new WebSocket(`ws://${address}`);
        this.isOpen = false;

        this.socket.onopen = () => {
            this.isOpen = true;
        }
    
        this.socket.onerror = function(e) {
            Alert.alert(
                "Ошибка",
                e.message,
                [
                  {
                    text: "Ok",
                    style: "default",
                  },
                ],
                {
                  cancelable: true
                }
              );
        }

        this.socket.onmessage = onMessage;
    }

    send(data) {
      if (this.isOpen) {
        this.socket.send(JSON.stringify(data));
      } else {
        let setIntervalId = setInterval(() => {
          if (this.isOpen) {
            this.socket.send(JSON.stringify(data));
            clearInterval(setIntervalId);
          }
        }, 0);
      }
    }
  
    close() {
      if (this.isOpen) {
        this.socket.close();
      }
    }
}

export default Sender;
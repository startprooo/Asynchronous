import { defineComponent, ref, onMounted } from 'vue';
import { RFB } from 'novnc-core';

export default defineComponent({
  name: 'BrowserViewer',
  props: {
    width: {
      type: Number,
      default: 1024
    },
    height: {
      type: Number,
      default: 768
    }
  },
  setup(props) {
    const vncContainer = ref<HTMLDivElement | null>(null);
    let rfb: RFB | null = null;

    onMounted(() => {
      if (vncContainer.value) {
        // Connect to VNC server through websockify
        rfb = new RFB(vncContainer.value, 'ws://' + window.location.hostname + ':8080/websockify');
        
        rfb.scaleViewport = true;
        rfb.resizeSession = true;

        rfb.addEventListener('connect', () => {
          console.log('Connected to VNC');
        });

        rfb.addEventListener('disconnect', () => {
          console.log('Disconnected from VNC');
        });

        rfb.addEventListener('credentialsrequired', () => {
          console.log('VNC credentials required');
        });
      }
    });

    return {
      vncContainer
    };
  }
});

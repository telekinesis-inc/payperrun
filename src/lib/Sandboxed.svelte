<script>
  import { onDestroy, onMount } from 'svelte';
  import * as TK from 'telekinesis-js';

  export let params;
  export let srcdoc;

  let iframe, messageHandler, updateParams, lastSrcdoc, sameIframe, height = 10;
  // const TK = globalThis.TK;

  const session = new TK.Session();
  const connection = new TK.Connection(session);

  $: {
    // console.log(updateParams, params, session.sessionKey.publicSerial())
    if (srcdoc != lastSrcdoc) {
      sameIframe = false;
      lastSrcdoc = srcdoc;
      updateParams = undefined;
    }
    if (updateParams) {
      updateParams(params).then(() => null);
    }
  }
  
  class MessageHandler extends Function {
    constructor() {
      super('return arguments.callee._call.apply(arguments.callee, arguments)')
      this.prevOnMessage = undefined;
    }
    
    async _call(m) {
      // console.log(sameIframe, m?.source == iframe.contentWindow, connection.websocket)
      if (m?.source == iframe.contentWindow) {
        if (connection.websocket == undefined || !sameIframe) {
          // console.log('updating connection')
          sameIframe = true;
          // @ts-ignore
          connection.websocket = {
            readyState: 1,
            send: async x => {
              m?.source?.postMessage(x, '*')
            },
          }
          // console.log('should update params')
          
          updateParams = await new TK.Telekinesis(TK.Route.fromObject(JSON.parse(String.fromCharCode.apply(null, m.data))), session)//.then(async x => {
          // await updateParams(params)
        } else {
          // @ts-ignore
          connection.recv({data: new Blob([m.data.buffer])})
        }
      }
      if (this.prevOnMessage) {
        return this.prevOnMessage(m);
      }
    }
  }
  onMount(() => {
    messageHandler = new MessageHandler();
    messageHandler.prevOnMessage = window.onmessage;

    // @ts-ignore
    window.onmessage = messageHandler;

  })
  onDestroy(() => {
    if (window.onmessage == messageHandler) {
      window.onmessage = messageHandler.prevOnMessage;
    } else {
      // @ts-ignore
      window.onmessage.prevOnMessage = messageHandler.prevOnMessage;
    }
  })
</script>

{#if srcdoc}
  <main bind:clientHeight={height}>
    <iframe sandbox="allow-scripts allow-popups" srcdoc={srcdoc} bind:this={iframe} title="test" height={height-5} width="100%"/>
  </main>
{/if}

<style>
  iframe {
    border: none;
  }
  main {
    flex-grow: 1000;
  }
</style>

<script lang="ts">
  import router from 'page';
  import * as TK from 'telekinesis-js';
  import { onMount } from 'svelte';

  // import {LRU} from './utils';
  import NavBar from './lib/NavBar.svelte';
  import Sandboxed from './lib/Sandboxed.svelte';
  import PathBar from './lib/PathBar.svelte';

  let path, title, srcDoc, sessionKey, user, node, entrypoint, userId, state;

  const STATES = Object.fromEntries(
    ['inBetween', 'unauthenticated', 'awaitingAuthentication', 'authenticated', 'error'].map(x => [x, x])
  );

  // const TK = globalThis.TK;
  globalThis.TK = TK;

  onMount(async () => {
    // globalThis.TK = TK;
    globalThis.router = router; 
    sessionKey = localStorage.getItem('payPerRunSessionKey') || sessionStorage.getItem('payPerRunSessionKey');

    entrypoint = new TK.Entrypoint('wss://payper.run', sessionKey || undefined) as any;

    globalThis.user = user;
    router('/*', async (ctx) => {
      title = ctx.params[0];
      path = title;
      if (user) {
        node = await user.get('/'+path);
        globalThis.node = node;
        srcDoc = await node.display;
        window.scrollTo(0, 0);
      } else {
      }
      // stats.record('sign_in').then(() => null)
    })
    router.start();
    if (sessionKey) {
      try {
        user = await TK.authenticate(entrypoint, null, null)
        userId = await user.path.strip('/');
        router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : ('/'+userId))
      } catch (e) {
        console.log(e);
      }
    }
    if (!user) {
      user = entrypoint;
      router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : '/_/welcome')
    }
    globalThis.user = user;
    // try {
    //   user = await user;
    // } catch (e) {
    //   console.log(e);
    //   user = backend;
    //   globalThis.user = user;
    // }

  })  
  // const cache = new LRU(x => x+'.'+ Date.now()/1000);
</script>

<svelte:head><title>PayPerRun.com | {title || "Code. Publish. Earn"}</title></svelte:head>

<NavBar>
  {#if !path}
    <div style='flex-grow: 1;'/>
  {/if}
    <div style="display: flex; align-items: center">
      <!-- <a class="" href="/" style="padding: 0px; margin-right: 8px">
        <img src='/favicon.png' class='' alt='≈' style='height: 48px;'/>
      </a> -->
      <!-- {#if path} -->
        <a class="" href={userId? "/_/market" : "/_/welcome"} style="font-weight: 800; font-size: 24px; color: var(--primary-color); font-family: monospace">
          <span style="background-color: var(--primary); color: var(--background); border-radius: 25px; padding: 5px 10px 5px 5px; margin: 5px; font-weight:900">
            {"/>"}
          </span>
        </a>
      {#if !path}
        <a class="" href="/" style="font-weight: 800; font-size: 24px; color: 'var(--primary-color)'; font-family: monospace">
          <span style="color: var(--primary); ">PayPerRun</span>.com
        </a>
      {/if}
    </div>
  {#if path}
    <PathBar path={path}/>
  {/if}
  <div style='flex-grow: 1;'/>
  {#if !userId}
    <a href='/_/sign_in'>Sign in</a>
  {/if}
</NavBar>

<main>  
  <Sandboxed srcdoc={srcDoc} params={{
    node: node, 
    requestRedirect: url => {
      if (url.slice(0, 8) == 'https://'){ 
        window.location.href = url;
      } else {
        router.redirect(url)
      }
    },
    requestSearchParams: () => Object.fromEntries(new URLSearchParams(window.location.search)),
    requestStoreKey: async longTerm => {
      let storage, otherStorage;
      if (longTerm) {
        storage = localStorage;
        otherStorage = sessionStorage;
      } else {
        storage = sessionStorage;
        otherStorage = localStorage;
      }
      storage.setItem('payPerRunSessionKey', await user._session.sessionKey.exportKey())
      otherStorage.removeItem('payPerRunSessionKey');
    },
    requestReauthenticate: async () => {
      user = await TK.authenticate(entrypoint, null, null)
      globalThis.user = user;
      console.log(user)
      userId = await user.path.strip('/')
    }
  }}/>
  <div id='filler'></div>
</main>

<style>
  main {
    min-height: calc(100vh - 80px);
    box-shadow: 0px -5px 15px #aaa;
    width: 100%;
    margin: 0;
    display: flex;
    text-align: center;
    flex-direction: column;
    z-index: -99;
    overflow-x: hidden;
  }
  #filler {
    width: 100%;
    background-color: var(--background);
    flex-grow: 1;
  }
</style>

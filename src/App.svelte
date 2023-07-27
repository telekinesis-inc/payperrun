<script lang="ts">
  import router from 'page';
  import * as TK from 'telekinesis-js';
  import { onMount } from 'svelte';

  // import {LRU} from './utils';
  import NavBar from './lib/NavBar.svelte';
  import Sandboxed from './lib/Sandboxed.svelte';
  import PathBar from './lib/PathBar.svelte';
  import Dropdown from './lib/Dropdown.svelte';
    import UserMenu from './lib/UserMenu.svelte';

  let path, title, srcDoc, sessionKey, user, node, entrypoint, userId, state, avatarSrc, shareable;
  let showUserMenu = false;
  let pendingRequests = [];

  // const STATES = Object.fromEntries(
  //   ['inBetween', 'unauthenticated', 'awaitingAuthentication', 'authenticated', 'error'].map(x => [x, x])
  // );

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
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const displayParamsStr = searchParams.get('displayParams')
          shareable = await node.shareable;
          srcDoc = await node.display(searchParams.get('display'), displayParamsStr && JSON.parse(displayParamsStr));
        } catch (e) {
          srcDoc = "<h1>Default display will go here</h1>"
        }
        window.scrollTo(0, 0);
      } else {
      }
      // stats.record('sign_in').then(() => null)
    })
    router.start();
    if (sessionKey) {
      try {
        [user, avatarSrc] = await TK.authenticate(entrypoint, null, null, {get_avatar_url: true})
        userId = await user.path.strip('/');
        router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : ('/'+userId))
        
        await user.battery.register_callback((r) => {pendingRequests.push([r.request_id, r]); showUserMenu = true; console.log(r)})

        pendingRequests = Object.entries(await user.battery.requests || {});
        console.log(pendingRequests)
        if (pendingRequests.length) {
          showUserMenu = true;
        }
      } catch (e) {
        console.log(e);
      }
    }
    if (!user) {
      user = entrypoint;
      router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : '/>/welcome')
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
  const respondRequest = async (requestId, response, i) => {
    await user.battery.respond_request(requestId, response); 
    pendingRequests = [...pendingRequests.slice(0, i), ...pendingRequests.slice(i+1)];
  }
</script>

<svelte:head><title>PayPerRun.com | {title || "Code. Publish. Earn"}</title></svelte:head>

<NavBar>
  {#if path}
    <PathBar path={path}/>
  {:else}
    <!-- <div style='flex-grow: 1;'/> -->
    <div style="display: flex; align-items: center">
      <a class="" href="/" style="font-weight: 800; font-size: 24px; color: 'var(--primary-color)'; font-family: monospace">
        <span style="color: var(--primary); ">PayPerRun</span>.com
      </a>
    </div>
  {/if}
  <div style='flex-grow: 1;'/>
  {#if userId}
    <UserMenu {...{showUserMenu, avatarSrc, userId, pendingRequests, respondRequest}} getBatteryStatus={async () => {return await user.battery.status}}
      signOut={async () => {
        let signOut = await user.get('/>/sign_out')(); 
        await signOut(); 
        userId = undefined;
        avatarSrc = undefined;
        router.redirect('/>/welcome');
        user = entrypoint;
        globalThis.user = user;
        }}
      />
  {:else}
    <button on:click={() => router.redirect('/>/sign_in')}>Join / Sign-in</button>
  {/if}
</NavBar>

<main>  
  <Sandboxed srcdoc={srcDoc} params={{
    node: shareable, 
    requestRedirect: (url, newWindow=false) => {
      console.log(url, newWindow);
      if (newWindow) {
        Object.assign(document.createElement('a'), {
          target: '_blank',
          rel: 'noopener noreferrer',
          href: url,
        }).click();
      } else {
        if (url.slice(0, 8) == 'https://'){ 
          window.location.href = url;
        } else {
          router.redirect(url)
        }
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
      [user, avatarSrc] = await TK.authenticate(entrypoint, null, null, {get_avatar_url: true})
      globalThis.user = user;
      console.log(user)
      userId = await user.path.strip('/')
    },
    requestCopyToClipboard: (text) => {
      navigator.clipboard.writeText(text);
    }
  }}/>
  <div id='filler'></div>
</main>

<style>
  main {
    min-height: calc(100vh - 60px);
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

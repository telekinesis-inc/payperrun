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

  let path, srcDoc, sessionKey, user, node, entrypoint, userId, state, avatarSrc, shareable, isReadOnly, childrenNodes;
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
      path = ('/'+ ctx.params[0]).replaceAll(/\/\/+/g, '/').replace(/\/$/, '');
      if (user) {
        childrenNodes = await listNodes(path)
        node = await user.get(path);
        globalThis.node = node;
        isReadOnly = await node.is_read_only
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const displayParamsStr = searchParams.get('displayParams');
          shareable = await node.shareable;
          srcDoc = await node.display(searchParams.get('display'), displayParamsStr && JSON.parse(displayParamsStr));
        } catch (e) {
          srcDoc = undefined;//"<h1>Default display will go here</h1>"
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
  const requestNode = async (fullNode=false) => {
    if (fullNode) {
      if (path.slice(0, 3) != '/>/') {
        throw new Error('Only />  nodes can request the fullNode');
      }
      return node;
    }
    let tmpEntrypoint = await (new TK.Entrypoint('wss://payper.run') as any);
    return await new TK.Telekinesis(await shareable._delegate(await tmpEntrypoint._session.sessionKey.publicSerial()), tmpEntrypoint._session);
  }
  const listNodes = async p => {
    console.log(p);
    let lst = await user.list_nodes(p);
    console.log(lst);
    return lst.reduce((p, v) => {p['/'+v.split('/')[v.split('/').length - 1]] = v; return p}, {});
  }
    
</script>

<svelte:head><title>PayPerRun.com {path || "Code. Publish. Earn"}</title></svelte:head>

<NavBar>
  {#if path}
    <PathBar path={path} readOnly={isReadOnly} listNodes={listNodes} childrenNodes={childrenNodes} userId={userId}/>
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
    <UserMenu {...{showUserMenu, avatarSrc, userId, pendingRequests, respondRequest}} 
      getBatteryStatus={async () => {return await user.battery.status}}
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
    <a href='/>/sign_in' id='sign-in-header'>Join / Sign-in</a>
  {/if}
</NavBar>

<main>  
  <Sandboxed srcdoc={srcDoc} params={{
    requestNode, 
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
  #sign-in-header {
    border: solid var(--tertiary) 1px;
    color: var(--tertiary);
    border-radius: 10px;
    padding: 10px 20px 7px;
    transition: 0.5s; 
  }
  #sign-in-header:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
</style>

<script lang="ts">
  import router from 'page';
  import * as TK from 'telekinesis-js';
  import { onMount } from 'svelte';

  // import {LRU} from './utils';
  import NavBar from './lib/NavBar.svelte';
  import Sandboxed from './lib/Sandboxed.svelte';
  import PathBar from './lib/PathBar.svelte';
  // import Dropdown from './lib/Dropdown.svelte';
  import UserMenu from './lib/UserMenu.svelte';
  import DisplayMenu from './lib/DisplayMenu.svelte';
  import Modal from './lib/Modal.svelte';
  import ServicesList from './lib/ServicesList.svelte';
    import { readonly } from 'svelte/store';

  let path, srcDoc, sessionKey, user, node, entrypoint, userId, displayState, avatarSrc, shareable, isReadOnly, childrenNodes, displayOptions, display, 
    authenticating, displayServices, displayWidth, pathOpen, showDisplayMenu, displayParams;
  
  let pathBarHeight, displayMenuHeight, userMenuHeight;
  let showUserMenu = false;
  let pendingRequests = [];
  let showModal = false;

  const DSTATES = Object.fromEntries(
    ['loading', 'unauthorized', 'newNode', 'noDisplay', 'ready', 'error'].map(x => [x, x])
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
      path = ('/'+ ctx.params[0]).replaceAll(/\/\/+/g, '/').replace(/\/$/, '');
      isReadOnly = true;
      displayState = DSTATES.loading;
      displayOptions = []; 
      if (user) {
        childrenNodes = await listNodes(path)
        try {
          node = await user.get(path);
          globalThis.node = node;
          const searchParams = new URLSearchParams(window.location.search);
          const displayParamsStr = searchParams.get('displayParams');
          display = searchParams.get('display'); 

          try {
            if (display && display.includes('/')) {
              srcDoc = await user.get('/>/market')().get(display)._call([], displayParamsStr && JSON.parse(displayParamsStr));
              displayState = DSTATES.ready;
            }
          } catch (e) {
            console.log(e);
            searchParams.delete('display')
            searchParams.delete('displayParams')
            // router.replace('?'+Array.from(searchParams.entries()).map(([k, v]) => k+'='+v).join('&'));
          }
          let displayAttribute = await node.get_attribute('display');
          if (displayState == DSTATES.ready) {
            if (await displayAttribute.is_placeholder) {
              displayOptions = [];
            } else {
              displayOptions = [... await displayAttribute.list_attributes()];
            }
          } else {
            if (await displayAttribute.is_placeholder) {
              displayState = DSTATES.noDisplay;
              showDisplayMenu = true;
              displayOptions = [];
            } else {
              try {
                [srcDoc, displayParams] = await node.display(display, displayParamsStr && JSON.parse(displayParamsStr));
                displayState = DSTATES.ready;
              } catch(e) {
                displayState = DSTATES.error;
                console.log(e)
              }
              displayOptions = [... await displayAttribute.list_attributes()];
            }
          }
          displayParams = {...(displayParams || {}), ...(displayParamsStr && JSON.parse(displayParams))};
          shareable = await node.shareable;
          isReadOnly = await node.is_read_only
        } catch (e) {
          node = null;
          globalThis.node = node;
          console.log(e);
          displayState = DSTATES.unauthorized;
        }
        // window.scrollTo(0, 0);
      }
      // stats.record('sign_in').then(() => null)
    })
    router.start();
    if (sessionKey) {
      try {
        authenticating = true;
        [user, avatarSrc] = await TK.authenticate(entrypoint, null, null, {get_avatar_url: true})
        authenticating = false;
        userId = await user.path.strip('/');
        router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : ('/'+userId))
        
        await user.battery.register_callback((r) => {pendingRequests.push([r.request_id, r]); showUserMenu = true; console.log(r)})

        pendingRequests = Object.entries(await user.battery.requests || {});
        if (pendingRequests.length) {
          showUserMenu = true;
        }
      } catch (e) {
        authenticating = false;
        console.log(e);
      }
    }
    if (!user) {
      user = entrypoint;
      router.replace(window.location.pathname.slice(1) ? window.location.pathname + window.location.search : '/>/welcome')
    }
    globalThis.user = user;

  })  
  // const cache = new LRU(x => x+'.'+ Date.now()/1000);
  const respondRequest = async (requestId, response, i) => {
    await user.battery.respond_request(requestId, response); 
    pendingRequests = [...pendingRequests.slice(0, i), ...pendingRequests.slice(i+1)];
  }
  const requestNode = async (requestedPath=undefined, readOnly=true, fullNode=false) => {
    if (fullNode) {
      if (path.slice(0, 3) != '/>/' || (display && display.includes('/'))) {
        throw new Error('Only />  nodes can request the fullNode');
      }
      if (requestedPath && typeof(requestedPath) === 'string') {
        if (path[0] == '/') {
          if (readOnly){
            return await user.get(requestedPath).read_only;
          }
          return await user.get(requestedPath)
        }
        if (readOnly) {
          return await node.get(requestedPath).read_only;
        }
        return await node.get(requestedPath);
      }
      if (readOnly) {
        return await node.read_only
      }
      return node;
    }
    if (requestedPath) {
      throw new Error('Request node.path not implemented yet');
    }
    let tmpEntrypoint = await (new TK.Entrypoint('wss://payper.run') as any);
    if (readOnly) {
      let out = await shareable.read_only
      return await new TK.Telekinesis(await out._delegate(await tmpEntrypoint._session.sessionKey.publicSerial()), tmpEntrypoint._session);
    }
    return await new TK.Telekinesis(await shareable._delegate(await tmpEntrypoint._session.sessionKey.publicSerial()), tmpEntrypoint._session);
  }
  const listNodes = async p => {
    let lst = await user.list_nodes(p);
    return lst.reduce((p, v) => {p['/'+v.split('/')[v.split('/').length - 1]] = v; return p}, {});
  }
    
</script>

<svelte:head><title>PayPerRun.com {path || "Code. Publish. Earn"}</title></svelte:head>

<svelte:window bind:innerWidth={displayWidth}/>

<NavBar headerHeight={displayWidth < 600? Math.max((pathOpen != undefined) && pathBarHeight || 0, showDisplayMenu && displayMenuHeight || 0, showUserMenu && userMenuHeight || 0) || null: null} scroll={displayWidth < 600}>
  {#if path}
    <PathBar path={path} readOnly={isReadOnly} listNodes={listNodes} childrenNodes={childrenNodes} userId={userId} preOpenChildren={!node} bind:selectedStep={pathOpen} 
      on:expanded={e => {pathBarHeight = e.detail}} router={router}/>
  {:else}
    <!-- <div style='flex-grow: 1;'/> -->
    <div style="display: flex; align-items: center">
      <a class="" href="/" style="font-weight: 800; font-size: 24px; color: 'var(--primary-color)'; font-family: monospace">
        <span style="color: var(--primary); ">PayPerRun</span>.com
      </a>
    </div>
  {/if}
  <div style='flex-basis: 20px;'/>
  {#if node}
    <DisplayMenu selectedDisplay={display} availableDisplays={displayOptions} readOnly={isReadOnly} showDisplayMenu={showDisplayMenu} on:expanded={e => {displayMenuHeight = e.detail}}
      on:pickDisplay={async () => {showModal = true; displayServices = await user.get('/>/core/tag/display').get_attribute('list').value}}
      on:saveDisplay={async ({detail}) => {
        console.log('save', detail)
        if (await user.get(path).is_placeholder) {
          await node.set(null);
        } 
        if (await node.get_attribute('display').is_placeholder) {
          await node.get_attribute('display').set(null);
        }
        await node.get_attribute('display').get_attribute(detail || null).set({
          'pipeline': [['node', ['get', 'get'], ['call', [['/>/market'], {}]], ['call', [[], {}]], ['get', 'get'], ['call', [[display], {}]], ['call', [[], {}]]]]
        }).get_attribute('params').set(displayParams);
        window.history.pushState({},'',  window.location.pathname + (detail ? '?display='+detail : ''));
      }}
      /> 
  {/if}
  <div style='flex-grow: 1;'/>
  {#if authenticating}
    ...
  {:else}
    {#if userId}
      <UserMenu {...{avatarSrc, userId, pendingRequests, respondRequest}} 
        getBatteryStatus={async () => {return await user.battery.status}}
        bind:showUserMenu={showUserMenu}
        on:expanded={e => {userMenuHeight = e.detail}}
        signOut={async () => {
          let signOut = await user.get('/>/auth/sign_out')(); 
          await signOut(); 
          userId = undefined;
          avatarSrc = undefined;
          router.redirect('/>/welcome');
          user = entrypoint;
          globalThis.user = user;
          }}
        />
    {:else}
      <a href='/>/auth/sign_in' id='sign-in-header'>Join {(displayWidth > 500) ? '/ Sign-in':''}</a>
    {/if}
  {/if}
</NavBar>

<main>  
  <Modal visible={showModal} on:close={() => {showModal = false}} style='min-height: 70vh;'>
    {#if displayServices && displayServices.length}
      <ServicesList services={displayServices} on:select={(p) => router.redirect('?display='+p.detail.path)}/>

    {/if}
  </Modal>
  {#if displayState == DSTATES.ready}
    <Sandboxed srcdoc={srcDoc} params={{
      request: {
        node: requestNode,
        redirect: (url, newWindow=false) => {
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
        searchParams: () => Object.fromEntries(new URLSearchParams(window.location.search)),
        storeKey: async longTerm => {
          if (path.slice(0, 3) != '/>/' || (display && display.includes('/'))) {
            throw new Error('Only />  nodes can request the fullNode');
          }
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
        reauthenticate: async () => {
          if (path.slice(0, 3) != '/>/' || (display && display.includes('/'))) {
            throw new Error('Only />  nodes can request the fullNode');
          }
          [user, avatarSrc] = await TK.authenticate(entrypoint, null, null, {get_avatar_url: true})
          globalThis.user = user;
          console.log(user)
          userId = await user.path.strip('/')
        },
        refreshNode: async () => {
          node = await user.get(path);
          globalThis.node = node;
        },
        copyToClipboard: (text) => {
          navigator.clipboard.writeText(text);
        },
        displayParams: displayParams && JSON.parse(JSON.stringify(displayParams)),
        saveDisplayParams: async (newParams) => {
          displayParams = newParams;
          if (display && display.includes('/') || isReadOnly) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('displayParams', JSON.stringify(displayParams))
            window.history.pushState({}, '', window.location.pathname + '?' + Array.from(searchParams.entries()).map(x => x.join('=')).join('&'));
          } else {
            await node.get_attribute('display').get_attribute(display).get_attribute('params').set(displayParams)
          }
        }
    }}}/>
    <div id='filler'></div>
  {:else}
    <p style="opacity: 30%">{displayState}</p>
  {/if}
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

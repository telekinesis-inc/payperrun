<script>
  import { createEventDispatcher } from "svelte";
  import Dropdown from "./Dropdown.svelte";

  export let showUserMenu;
  export let avatarSrc;
  export let userId;
  export let pendingRequests;
  export let respondRequest;
  export let getBatteryStatus;
  export let signOut;

  let batteryStatus;

  const dispatch = createEventDispatcher();
  const updateBatteryStatus = async () => {
    batteryStatus = '...';
    
    let status = await getBatteryStatus();

    batteryStatus = `${status.joules}J ${status.watts? status.watts +'W' :''}`;
  }
</script>

<Dropdown showContent={showUserMenu} on:mouseleave={() => {showUserMenu = false}} on:expanded={({detail}) => dispatch('expanded', detail)}
  contentStyle="border-radius: 20px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 400px; left: -354px"
>
  <img src={avatarSrc || '/__/user.svg'} alt="avatar" class='avatar' slot="button" class:invert-dark={avatarSrc === undefined} title="User Controls"
  style={showUserMenu ? "opacity: 100%" : ""} on:click={() => {showUserMenu = !showUserMenu;}} on:keydown={() => {}}/>
  <div slot='content' >
    <a href='/{userId}' class='item'>User node</a>

    {#if showUserMenu}
      <a href='/>/market/battery' class='item'>
      Battery status: 
      {#await updateBatteryStatus()}
      ...
      {:then}
        {batteryStatus}
      {/await}
    </a>

    {/if}

    <a href='/>/sign_out' class='item' on:click={async e => {e.preventDefault(); await signOut()}}>Sign out</a>

    {#each pendingRequests as [requestId, requestInfo], i}
      <div class="item">
        <p class="request" >"{requestInfo.destination_path}" requests {requestInfo.initial_energy}J + {requestInfo.power}W</p>
        <button on:click={() => respondRequest(requestId, true, i) && updateBatteryStatus()} class='requestButton'>Approve</button>
        <button on:click={() => respondRequest(requestId, false, i)} class='requestButton'>Decline</button>
      </div>
    {/each}
    
  </div>
</Dropdown>

<style>
  .avatar {
    height: 46px;
    border-radius: 23px;
    filter: grayscale(20%);
    opacity: 50%;
    cursor: pointer;
  }
  .avatar:hover {
    opacity: 80%;
    box-shadow: 0px 0px 5px #777 ;
  }
  .requestButton {
    padding: 5px;
    line-height: 12px;
  }
  .item {
    display: flex;
    justify-content: center;
    line-height: 50px;
    border-bottom: solid #7771 1px;
    padding: 0px 20px 0px 20px;
  }
  .request {
    flex-grow: 100;
    margin: 0px;

  }
  @media (prefers-color-scheme: dark) {
    .invert-dark {
      filter: invert();
    }
  }
</style>
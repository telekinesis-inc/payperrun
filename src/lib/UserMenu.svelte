<script>
  import Dropdown from "./Dropdown.svelte";

  export let showUserMenu;
  export let avatarSrc;
  export let userId;
  export let pendingRequests;
  export let respondRequest;
  export let getBatteryStatus;
  export let signOut;

  let batteryStatus;
  const updateBatteryStatus = async () => {
    batteryStatus = '...';
    
    let status = await getBatteryStatus();

    batteryStatus = `${status.joules}J ${status.watts? status.watts +'W' :''}`;
  }
</script>

<Dropdown showContent={showUserMenu} on:mouseleave={() => {showUserMenu = false}}
contentStyle="border-radius: 20px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 400px; left: -360px">
  <img src={avatarSrc} alt="avatar" class='avatar' slot="button" style={showUserMenu ? "opacity: 100%" : ""} on:click={() => {showUserMenu = !showUserMenu}} on:keydown={() => {}}/>
  <div slot='content' >
    <a href='/{userId}' class='item'>User node</a>

    {#if showUserMenu}
      <a href='/>/battery' class='item'>
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
    height: 40px;
    border-radius: 20px;
    filter: grayscale(20%);
    opacity: 50%;
    cursor: pointer;
  }
  .avatar:hover {
    opacity: 80%;
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
</style>
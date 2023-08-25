<script>
  import { createEventDispatcher } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import NamePrompt from "./NamePrompt.svelte";

  export let showDisplayMenu = false;
  export let selectedDisplay;
  export let availableDisplays;
  export let readOnly;

  let editing;
  $: detached = selectedDisplay && selectedDisplay.includes('/');

  const dispatch = createEventDispatcher();

</script>

<Dropdown showContent={showDisplayMenu} on:mouseleave={() => {if (!editing) {showDisplayMenu = false;}}} on:expanded={({detail}) => dispatch('expanded', detail)}
contentStyle="border-radius: 5px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 400px;">
  <button slot="button" class="dropdown" title={!readOnly && detached ? "Display not saved" : "Display Selector"} style={showDisplayMenu ? "opacity: 100%l" : ""} 
  on:click={() => {showDisplayMenu = !showDisplayMenu;}} on:keydown={() => {}}>
    <img src={'/__/eye.svg'} alt="display selector" class='eye' />

    <p class="display-name" class:warn={!readOnly && detached}>{selectedDisplay || ''}</p>
    <span class='arrow'>{'▼'}</span>
  </button>
  <div slot='content' class='content' >
    {#if (availableDisplays || []).length} 
      {#each (availableDisplays) as display}
        <a href={display && ('?display='+ display) || '?'} class='item' class:default={display === null} class:highlighted={display === selectedDisplay}
        on:click={() => {showDisplayMenu = false}}>
          {display || "default"}
        </a>
      {/each}
    {:else}
      <div class="item">This node doesn't have a display configured</div>
    {/if}
    {#if detached}
      {#if readOnly}
        <div class='item'>{selectedDisplay}</div>
      {:else}
        <!-- <div class='item'> -->
          <NamePrompt on:submit={(v) => {editing = false; dispatch('saveDisplay', v.detail);}} on:cancel={() => {editing = false}} bind:editing={editing} placeholder="Display name (empty → default)" regexTest={/[A-z0-9_ .\-]*/}>
            <div style='flex-grow: 1; padding: 0px 20px; color: var(--secondary); line-height: 3'>{selectedDisplay}</div>
            <button on:click={() => {editing = true}}>Save</button>
          </NamePrompt>
        <!-- </div> -->
      {/if}
    {/if}
    <button on:click={() => dispatch('pickDisplay')}>Pick a display from market</button>
  </div>
</Dropdown>

<style>
  .dropdown {
    display: flex;
    height: 45px;
    background-color: transparent;
    opacity: 50%;
    align-items: center;
  }
  .eye {
    height: 22px;
  }
  .dropdown:hover {
    opacity: 80%;
    border-color: #9995;
  }
  .dropdown:hover .arrow {
    opacity: 80%;
  }
  .arrow {
    font-size: 11px;
    opacity: 20%;
    padding-top: 8px;
    padding-left: 5px;
  }
  .display-name {
    margin-left: 10px;
    padding-top: 5px;
    color: var(--tertiary)
  }
  .content {
    display: flex;
    flex-direction: column;
  }
  .highlighted {
    font-weight: 700;
    color: var(--primary);
  }
  .warn {
    color: var(--secondary);
  }
  .default {
    font-style: italic;
  }
  .item {
    display: flex;
    justify-content: center;
    line-height: 50px;
    border-bottom: solid #7771 1px;
    padding: 0px 20px 0px 20px;
    color: var(--tertiary);
  }
  @media (prefers-color-scheme: dark) {
    .eye {
      filter: invert();
    }
  }
</style>
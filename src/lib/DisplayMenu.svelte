<script>
  // import { createEventDispatcher } from "svelte";
  import Dropdown from "./Dropdown.svelte";

  export let showDisplayMenu = false;
  export let selectedDisplay;
  export let availableDisplays;
  // export let saveDisplayCallback = undefined;

</script>

<Dropdown showContent={showDisplayMenu} on:mouseleave={() => {showDisplayMenu = false}}
contentStyle="border-radius: 20px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 400px;">
  <button slot="button" class="dropdown" title="Display Selector" style={showDisplayMenu ? "opacity: 100%l" : ""} 
  on:click={() => {showDisplayMenu = !showDisplayMenu}} on:keydown={() => {}}>
    <img src={'/__/eye.svg'} alt="display selector" class='eye' />

    <p style='margin-left: 10px;'>{selectedDisplay || ''}</p>
    <span class='arrow'>{'▼'}</span>
  </button>
  <div slot='content' >
    {#each availableDisplays as display}
      <a href={display && ('?display='+ display) || '?'} class='item' class:default={display === null} class:highlighted={display === selectedDisplay}>{display || "default"}</a>
    {/each}
    
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
  }
  .highlighted {
    font-weight: 700;
    color: var(--primary);
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
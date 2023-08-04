<script>
  import { createEventDispatcher } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import NamePrompt from "./NamePrompt.svelte";

  export let path;
  export let router;
  export let userId;
  export let preOpenChildren = false;
  export let readOnly = true;
  export let listNodes = undefined;
  export let childrenNodes = {};
  export let selectedStep = undefined;
  export let isPlaceholder = false;

  const dispatch = createEventDispatcher();

  let nSteps, editing= false, hover, nodes; 
  $: nSteps = path.slice(1).split('/').length;
</script>

<main>
  {#each path.slice(1).split('/') as step, i}
    <Dropdown 
      showContent={!preOpenChildren && (selectedStep === i)} 
      on:mouseleave={() => { if (!editing) {selectedStep = undefined} }}
      on:expanded={({detail}) => dispatch('expanded', detail)}
      contentStyle="border-radius: 5px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 300px;"
    >
      <a href={'/'+path.split('/').slice(1, 1+i).join('/')+'/'+step} slot="button" class='path-btn' class:first-btn={i==0} 
      class:placeholder={isPlaceholder && i == nSteps - 1}
      title={isPlaceholder && (i == (nSteps-1)) ? "Placeholder (Node not stored yet)" : undefined}
        on:click={async (e) => {
          e.preventDefault();
          preOpenChildren = false;
          selectedStep = i == selectedStep ? undefined : i
          nodes = null;
          nodes = await listNodes(path.split('/').slice(0, i+1).join('/') || '/');
        }}
        on:mouseenter={() => {hover = i}} on:mouseleave={() => {hover = undefined}}
      >
        <span class:owner={i==0} class:root={i==0 && step == '>'} class:other-owner={i==0 && step != '>' && step != userId}>
          /{step}
        </span>
        <span class='arrow' class:transparent={hover != i}>{'▼'} </span>
      </a>
      <div slot='content'>
        {#if nodes}
          {#each Object.entries(nodes) as [name, path]}
            <a class='item' href={path}>{name}</a>
          {/each}
        {:else}
          <p class='item'>...</p>
        {/if}
      </div>
    </Dropdown>
  {/each}
  {#if (!readOnly && !isPlaceholder) || Object.keys(childrenNodes).length}
    <Dropdown 
      showContent={preOpenChildren || (selectedStep === nSteps)} 
      on:mouseleave={() => { if (!editing) {selectedStep = undefined} }}
      on:expanded={({detail}) => dispatch('expanded', detail)}
      contentStyle="border-radius: 5px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 300px;"
    >
      <button slot="button" class='path-btn' class:placeholder={isPlaceholder} on:click={async () => {
          selectedStep = preOpenChildren || (nSteps == selectedStep) ? undefined : nSteps
          preOpenChildren = false;
          nodes = childrenNodes;
          nodes = await listNodes(path);
        }}
        on:mouseenter={() => {hover = nSteps}} on:mouseleave={() => {hover = undefined}}
      >
        /...
        <span class='arrow' class:transparent={hover != nSteps}>{'▼'}</span>
      </button>
      <div slot='content'>
        {#each ((preOpenChildren && Object.entries(childrenNodes)) || Object.entries(nodes) ) as [name, path]}
          <a class='item' href={path} on:click={() => {selectedStep = undefined; console.log(selectedStep); preOpenChildren = false}}>{name}</a>
        {/each}

        {#if !readOnly && !isPlaceholder}
          <NamePrompt on:submit={(v) => {editing = false; router.redirect(path+'/'+v.detail); console.log(v)}} on:cancel={() => {editing = false}} bind:editing={editing} placeholder="new child node's path">
            <button style='flex-grow: 1;' on:click={() => {editing = true}}>New Node</button>
          </NamePrompt>
        {/if}
      </div>
    </Dropdown>
  {/if}
</main>

<style>
  main {
    margin-top: 0;
    /* width: 100%; */
    /* background-color: var(--tertiary); */
    text-align: left;
    padding: 3px;
    display: flex;
    align-items: center;
    /* font-weight: 800; */
  }
  .path-btn {
    color: var(--tertiary);
    padding: 10px 1px 5px 1px;
    background-color: transparent;
    transition: 0.3s;
    display: flex;
    align-items: center;
    border: solid #9990 1px;
    border-radius: 10px;
    /* height: 40px; */
    line-height: 30px;
  }
  .path-btn:hover {
    border: solid #9995 1px;
  }
  .first-btn {
    /* padding: 7px 1px; */
    height: 45px;
    padding: 1px;
  }
  .arrow {
    font-size: 11px;
  }
  .transparent {
    opacity: 15%;
  }
  .placeholder {
    opacity: 50%;
  }
  .owner {
    border-radius: 25px;
    padding: 5px 10px 5px 5px;
    margin: 5px;
    color: var(--primary);
    border: solid var(--primary) 1px;
  }
  .other-owner {
    color: var(--secondary);
    border: solid var(--secondary) 1px;
  }
  .root {
    font-size: 24px;
    font-family: monospace;
    font-weight: 800;
    color: var(--background);
    background-color: var(--primary);
  }
  .item {
    display: flex;
    justify-content: left;
    line-height: 50px;
    border-bottom: solid #7771 1px;
    padding: 0px 20px
  }
</style>
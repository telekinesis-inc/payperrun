<script>
  import Dropdown from "./Dropdown.svelte";
  import NamePrompt from "./NamePrompt.svelte";

  export let path;
  export let selectedStep = undefined;
  // console.log('PathBar', path, mode)
//  href={`/${path.split('/').slice(0, i+1).join('/')}`}
  let nSteps, editing= false, hover;
  $: nSteps = path.split('/').length;
</script>

<main>
  {#each path.split('/') as step, i}
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button class='path-btn' on:mouseenter={() => {hover = i}} on:mouseleave={() => {hover = undefined}}>
      <span class:owner={i==0} class:root={i==0 && step == '>'}>/{step}</span><span class='arrow' class:transparent={hover != i}>{'▼'}</span></button>
  {/each}
  <Dropdown showContent={(selectedStep === nSteps) || false} on:mouseleave={() => { if (!editing) {selectedStep = undefined} }}
  contentStyle="border-radius: 5px; box-shadow: 0px 0px 5px #7773; background-color: var(--background); width: 300px;">
    <button slot="button" class='path-btn' on:click={() => {selectedStep = nSteps == selectedStep ? undefined : nSteps}} 
      on:mouseenter={() => {hover = nSteps}} on:mouseleave={() => {hover = undefined}}>
      /...
      <span class='arrow' class:transparent={hover != nSteps}>{'▼'}</span>
    </button>
    <div slot='content' >
      <NamePrompt title='New Node' initialButtonStyle="flex-grow: 1;" on:submit={(v) => {editing = false; console.log(v)}} 
        on:cancel={() => {editing = false}} on:edit={() => {editing = true}}/>
    </div>
  </Dropdown>
</main>

<style>
  main {
    margin-top: 0;
    /* width: 100%; */
    /* background-color: var(--tertiary); */
    text-align: left;
    padding: 3px;
    /* font-weight: 800; */
  }
  .path-btn {
    color: var(--tertiary);
    text-decoration: solid;
    padding: 10px 1px 7px 1px;
    background-color: transparent;
  }
  .arrow {
    font-size: 11px;
  }
  .transparent {
    opacity: 15%;
  }
  .owner {
    border-radius: 25px;
    padding: 5px 10px 5px 5px;
    margin: 5px;
    color: var(--primary);
    border: solid var(--primary) 1px;
  }
  .root {
    font-size: 24px;
    font-family: monospace;
    font-weight: 800;
    color: var(--background);
    background-color: var(--primary);
  }
</style>
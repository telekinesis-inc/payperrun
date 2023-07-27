<script>
  import { createEventDispatcher } from 'svelte';

  export let title;
  export let initialValue = '';
  export let initialButtonStyle = '';

  let lastValue = initialValue;
  let editing = false;
  let value = lastValue;

  // console.log(childName, originalChildName)

  const dispatch = createEventDispatcher()
  const cancel = () => {editing = false; value = lastValue; dispatch('cancel')}
  const accept = () => {dispatch('submit', value); editing=false; lastValue = value}

</script>


<div class="container">
  {#if editing}
    <input bind:value={value} on:keydown={e => e.key == 'Enter' ? accept(): e.key == 'Esc' ? cancel(): null} style='min-width: 0px'/>
    <button on:click={cancel} >{'⨯'}</button>
    <button on:click={accept} disabled={value.length == 0} >{'✓'}</button>
  {:else}
    <button style={initialButtonStyle || ''}
      on:click={() => {editing = true; dispatch('edit')}} >{title}</button>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  } 
  input {
    flex-grow: 1;
  }
</style>
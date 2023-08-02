<script>
  import { createEventDispatcher } from 'svelte';

  export let editing = false;
  export let initialValue = '';
  export let placeholder = ''
  export let regexTest = /[A-z0-9_]+/;

  let lastValue = initialValue;
  let value = lastValue;

  $: testFail = regexTest && (value != (regexTest.exec(value) && regexTest.exec(value)[0]))
  // console.log(childName, originalChildName)

  const dispatch = createEventDispatcher()
  const cancel = () => {editing = false; value = lastValue; dispatch('cancel')}
  const accept = () => {dispatch('submit', value); editing=false; lastValue = value}

</script>


<div class="container">
  {#if editing}
    <input bind:value={value} on:keydown={e => e.key == 'Enter' ? accept(): e.key == 'Esc' ? cancel(): null} style='min-width: 0px' placeholder={placeholder}/>
    <button class="cancel" on:click={cancel} >{'⨯'}</button>
    <button on:click={accept} disabled={testFail} title={testFail?`Input does not pass regex: '${regexTest}'`: undefined}>{'✓'}</button>
  {:else}
    <slot/>
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
    border-radius: 5px;
    border: solid #8884 1px;
    padding: 1px 10px;
  }
  input::placeholder {
    font-style: italic;
  }
  input:focus {
    outline: none;
  }
  button:disabled {
    color: #8884;
  }
  button:disabled:hover {
    border-color: #8884;
  }
  .cancel:hover {
    border-color: var(--secondary);

  }
</style>
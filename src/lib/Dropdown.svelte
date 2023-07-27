<script>
  import { createEventDispatcher } from "svelte";
  // export let style='border: none; background-color: transparent;';
  // export let title;
  export let contentStyle;
  
  const dispatch = createEventDispatcher()

  export let showContent = false;
  let buttonHeight;
</script>

<div class="dropdown" on:keydown={(e) => {console.log(e)}} on:mouseleave={() => dispatch('mouseleave', {})}>
  <div class="dropdown-button" bind:clientHeight={buttonHeight}>
    <slot name='button'/>
  </div>
  <!-- <button style={style} on:click={() => {showContent = !showContent}}>{title}</button> -->
  {#if showContent}
    <div class="dropdown-content" style='padding-top: {buttonHeight || 0}px; {contentStyle || ''}'>
      <slot name='content'/>
    </div>
  {/if}
</div>

<style>
  .dropdown {
    display: inline-block;
    position: relative;
    /* box-shadow: 0px 3px 3px 2px rgba(0,0,0,0.1); */
  }
  .dropdown-button {
    line-height: 1px;
    position: relative;
    z-index: 100;
  }
  .dropdown-content {
    display: flex;
    position: absolute;
    overflow: auto;
    flex-direction: column;
    align-items: stretch;
    z-index: 99;
    top: 0;
  }

</style>
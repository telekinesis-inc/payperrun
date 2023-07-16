<script>
  // export let style='border: none; background-color: transparent;';
  // export let title;
  export let width = 200;
  export let left = 0;
  export let backgroundColor = 'var(--background)';

  export let showContent = false;
</script>

<div class="dropdown" >
  <div on:click={() => {console.log('here', showContent);showContent = !showContent;}} 
    on:keydown={() => {}} on:keyup={console.log} on:keypress={console.log} on:mouseleave={() => {showContent = false}}>
    <slot name='button'/>
  </div>
  <!-- <button style={style} on:click={() => {showContent = !showContent}}>{title}</button> -->
  {#if showContent}
    <div class="dropdown-content" style='width: {width}px; left: {left}px; background-color: {backgroundColor}'>
      <slot name='content'/>
    </div>
  {/if}
</div>

<style>
  .dropdown {
    display: inline-block;
    position: relative;
  }
  .dropdown-content {
    display: flex;
    position: absolute;
    overflow: auto;
    /* box-shadow: 0px 3px 3px 2px rgba(0,0,0,0.1); */
    flex-direction: column;
    align-items: stretch;
    z-index: 99;
  }

</style>
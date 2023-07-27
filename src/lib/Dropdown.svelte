<script>
  // export let style='border: none; background-color: transparent;';
  // export let title;
  export let width = 200;
  export let left = 0;
  export let contentStyle;

  export let showContent = false;
  let buttonHeight;
</script>

<div class="dropdown" on:keydown={(e) => {console.log(e)}} on:mouseleave={() => {showContent = false}}>
  <div class="dropdown-button" on:click={() => {console.log('here', showContent);showContent = !showContent;}} 
    on:keydown={(e) => {console.log(e)}} bind:clientHeight={buttonHeight}>
    <slot name='button'/>
  </div>
  <!-- <button style={style} on:click={() => {showContent = !showContent}}>{title}</button> -->
  {#if showContent}
    <div class="dropdown-content" style='width: {width}px; left: {left}px; padding-top: {buttonHeight || 0}px; {contentStyle || ''}'>
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
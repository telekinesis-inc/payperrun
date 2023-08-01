<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let visible;
</script>
  
<div id="modal" style="
  opacity: {visible? 2 : 0};
  visibility: {visible? 'visible' : 'hidden'};"
>
  <div id="modal-window">
    <button id="close-button" style="" on:click={()=>{visible = false; dispatch('close')}}>
      &#x2716;
    </button>
    <div id="modal-content">
      <slot></slot>
    </div>
  </div>
  <div id="overlay" on:click={() => {visible = false; dispatch('close')}}></div>
</div>

<style>
  #modal {
    left: 0;
    top: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    transition: all .4s ease-in-out;
    -moz-transition: all .4s ease-in-out;
    -webkit-transition: all .4s ease-in-out;
    z-index: 101;
  }
  #modal-window {
    position: fixed;
    max-height: 95vh;
    width: 98%;
    z-index: 120;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    background-color: var(--background);
    text-align: center;
    box-shadow: 0 0 15px 5px rgba(200,200,200,.25);
    box-sizing: border-box;
    padding: 10px;
    overflow: hidden;
  }
  #modal-content {
    overflow: auto;
    max-height: calc(95vh - 60px);
  }
  :global(ul) {
    text-align: left;
  }
  :global(ol) {
    text-align: left;
  }
  #close-button {
    position: fixed; 
    top: 0;
    right: 0;
    border-radius: 5px;
    background-color: var(--background);
  }
  #overlay {
    background-color: #000;
    background: rgba(0,0,0,.8);
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 110;
  }
  @media (min-width: 800px) {
    #modal-window {
      width: 80%;
      padding: 30px;
    }
  }
</style>
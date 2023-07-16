<script>
  import { onMount } from "svelte";

  let i = 0;
  export let message = "";
  export let style = "";

  onMount(() => {
    const interval = setInterval(() => {i = (i+1)%3}, 400)
    return () => clearInterval(interval);
  })
</script>

<p {style}>
  
  <!-- <img src="./img/waiting.svg" style="width:200px; height:145px" alt="value prop">
  <br> -->
  {message}
  {#each Array(3) as _, ii}
    {#if ii <= i}
      .
    {:else}
      &nbsp;
    {/if}
  {/each}
</p>

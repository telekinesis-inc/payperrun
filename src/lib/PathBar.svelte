<script>
  export let path;
  // console.log('PathBar', path, mode)
</script>

<main>
  {#each path.split('/') as step, i}
    <a href={`/${path.split('/').slice(0, i+1).join('/')}`}>{step}/</a>
  {/each}
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
  main a {
    color: var(--secondary);
    text-decoration: solid;
  }
</style>
<script>
  export let path;
  // console.log('PathBar', path, mode)
</script>

<main>
  {#each path.split('/') as step, i}
    <a class:owner={i==0} class:root={i==0 && step == '>'} href={`/${path.split('/').slice(0, i+1).join('/')}`}>/{step}</a>
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
    color: var(--tertiary);
    text-decoration: solid;
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
<script>
  import { createEventDispatcher } from 'svelte';

  export let services;
  export let showUsdFirst = true;

  const dispatch = createEventDispatcher();

  let selected, selectedDelayed;

  const usdPriceStr = (energy, power) => 
    (energy || power) ? 
      '~' + ((energy ? ('$'+(energy/1e6).toPrecision(2) + ((power || '')  && ' + ')): "") + (power ? ('$'+(power/1e6*60).toPrecision(2) + '/min') : "")) 
      : "Free"
  const consumptionStr = (energy, power) => 
    (energy || power) ? 
      ((energy ? (energy + 'J' + ((power || '')  && ' + ')): "") + (power ? (power + 'W') : "")) 
      : "Free"
</script>

<div id="container" on:mouseleave={() => {selected = undefined}}>
  {#each services as service}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="service" on:mouseenter={() => {selected = service.path; setTimeout(() => {selectedDelayed = service.path}, 100)}}
    on:click={async () => ((selected == service.path) && (selected == selectedDelayed)) ? 
      dispatch('select', {'path': service.path}) : 
      (() => {selected = service.path; setTimeout(() => {selectedDelayed = service.path}, 100)})()}
    class:selected={service.path == selected}>
      <div class="owner" class:highlighted={service.owner == '/>'}>{service.owner}</div>
      <div class="name"> {service.name}</div>
      {#if selected == service.path}
        <div class="description">{service.description}</div>
      {/if}
      <div style='flex-grow: 1'/>
      <div class="consumption" class:highlighted={!service.energy && !service.power}
        title={(showUsdFirst ? consumptionStr: usdPriceStr)(service.energy, service.power)}>
        {(showUsdFirst ? usdPriceStr : consumptionStr)(service.energy, service.power)}</div>
    </div>
  {/each}
</div>
<style>
  #container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .service {
    width: 200px;
    height: 75px;
    border-color: #8883;
    border-style: solid;
    border-width: 0.5px;
    border-radius: 10px;
    margin: 25px;
    cursor: pointer;
    background-color: var(--background);
    transition: 0.5s;
  }
  .selected {
    height: 125px;
    width: 250px;
    margin: 0px;
    box-shadow: 0px 0px 15px #8885;
  }
  .owner {
    color: var(--tertiary);
    opacity: 50%;
    font-size: 13px;
  }

  .name {
    font-weight: 600;
  }
  .description {
    font-size: 14px;
  }
  .consumption {
    color: var(--secondary);
    font-size: 13px;

  }
  .highlighted {
    opacity: 100%;
    font-weight: 500;
    color: var(--primary);
  }
  .editor {
    border-radius: 6px;  
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    font-family: 'Source Code Pro', monospace;
    font-size: 14px;
    font-weight: 400;
    height: 340px;
    letter-spacing: normal;
    line-height: 20px;
    padding: 10px;
    tab-size: 2;
  }

</style>
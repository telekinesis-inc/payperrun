<script>
  import { createEventDispatcher } from 'svelte';

  export let services;
  export let showUsdFirst = true;

  const dispatch = createEventDispatcher();

  let selected, selectedDelayed;

  const usdPriceStr = (energy, power, deps, maxEnergy, maxPower) => 
    ((energy || power || maxEnergy || maxPower) ? 
      '~' + ((energy || maxEnergy ? ('$'+((energy || 0) /1e6).toPrecision(2) + (maxEnergy ? '-'+(maxEnergy/1e6).toPrecision(2) : '') + ((power || '')  && ' + ')): "") + 
      (power || maxPower ? ('$'+(power/1e6*60).toPrecision(2) + (maxPower ? '-' + (maxPower/1e6*60).toPrecision(2) : '') +'/min') : "")) 
      : "Free")  +
      (deps ? ' + deps' : '');
  const consumptionStr = (energy, power, deps, maxEnergy, maxPower) => 
    ((energy || power) ? 
      ((energy ? (energy + 'J' + ((power || '')  && ' + ')): "") + (power ? (power + 'W') : "")) 
      : "Free") +
    ((maxEnergy || maxPower) ? 
      ' - ' + ((maxEnergy ? (maxEnergy + 'J' + ((maxPower || '')  && ' + ')): "") + (maxPower ? (maxPower + 'W') : "")) 
      : "") + 
      (deps ? ' + deps' : '');

  const calculateCost = (service) => {
    if (service.cost[0] == 'Free') {return [0, 0, service.call_spec_dict?.dependencies != undefined]}
    if (service.cost[0] == 'Fixed') {return [service.cost[1].energy, service.cost[1].power, service.call_spec?.dependencies != undefined]}
    if (service.cost[0] == 'Grid') {
      let minTuple, maxTuple;
      let grid = service.cost[1].grid;
      for (let param in grid) {
        let elements = Object.values(grid[param]);
        console.log(param, grid[param], elements[0])
        if (!minTuple || (minTuple[0] >= elements[0][0] && minTuple[1] >= elements[0][1])) {
          minTuple = elements[0];
        }
        if (!maxTuple || (maxTuple[0] < elements[elements.length-1][0] && maxTuple[1] >= elements[elements.length-1][1])) {
          maxTuple = elements[elements.length-1];
        }
      }
      if (minTuple[0] == maxTuple[0] && minTuple[1] == maxTuple[1]) {
        return [minTuple[0], minTuple[1], service.call_spec?.dependencies != undefined]
      }
      return [minTuple[0], minTuple[1], service.call_spec?.dependencies != undefined, maxTuple[0], maxTuple[1]]
    }
  }
</script>

<div id="container" on:mouseleave={() => {selected = undefined}}>
  {#each services as service}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="service" on:mouseenter={() => {selected = service.path; setTimeout(() => {selectedDelayed = service.path}, 100)}}
    on:click={async () => ((selected == service.path) && (selected == selectedDelayed)) ? 
      dispatch('select', {'path': service.path}) : 
      (() => {selected = service.path; setTimeout(() => {selectedDelayed = service.path}, 100)})()}
    class:selected={service.path == selected}>
      <div class="owner" class:highlighted={service.path.split('/')[1] == '>'}>/{service.path.split('/')[1]}</div>
      <div style='flex-grow: 1;'/>
      <div class="name"> {service.name}</div>
      <div style='flex-grow: {selected == service.path ? '0.5' : '0'}; transition: 0.3s; '/>
      <div class="description" class:selected-description={selected == service.path}>{service.doc.split('\n')[0]}</div>
      <div style='flex-grow: 1'/>
      {#if service && service.cost}
        <div class="cost" class:highlighted={service.cost[0] == 'Free'}
          title={(showUsdFirst ? consumptionStr: usdPriceStr)(...calculateCost(service))}>
          {(showUsdFirst ? usdPriceStr : consumptionStr)(...calculateCost(service))}</div>
      {/if}
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
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 192px;
    height: 67px;
    border-color: #8883;
    border-style: solid;
    border-width: 0.5px;
    border-radius: 10px;
    padding: 4px;
    margin: 25px;
    cursor: pointer;
    background-color: var(--background);
    transition: 0.3s;
  }
  .selected {
    height: 105px;
    width: 230px;
    padding: 10px;
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
    font-size: 1px;
    opacity: 0%;
    width: 17px;
    line-height: 1.3;
    transition: 0.3s;
  }
  .selected-description {
    font-size: 14px;
    width: 238px;
    opacity: 100%;
  }
  .cost {
    color: var(--secondary);
    font-size: 13px;

  }
  .highlighted {
    opacity: 100%;
    font-weight: 500;
    color: var(--primary);
  }

</style>
<script>
	export let headerHeight = 55;
	export let scroll = false;
</script>

<header bind:clientHeight={headerHeight} style={(scroll? 'overflow-x: auto;': '')+'height: '+headerHeight+'px;'} >
	<div id='header-container' >
    <slot></slot>
	</div>
</header>

<div style="height:{headerHeight}px"></div>

<style>
	header {
		box-shadow: 0px -5px 15px #aaa;
		position: fixed;
		width: 100%;
		background-color: var(--background);
		z-index: 100;
		/* height: 55px; */
	}
	#header-container {
    display: flex;
		/* overflow-x: auto; */
		padding: 0px 10px;
    flex-direction: row;
    align-items: center;
		font-size: 18px;
		/* font-weight: 800; */
		/* letter-spacing: 0.4px; */
		margin: 0 auto;
		/* max-width: 1400px; */
		justify-content: stretch;
	}
</style>
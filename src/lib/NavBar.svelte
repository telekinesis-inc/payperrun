<script>
	let headerHeight;
</script>

<header bind:clientHeight={headerHeight}>
	<div id='header-container'>
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
	}
	#header-container {
		height: 45px;
    display: flex;
		padding: 10px;
    flex-direction: row;
    align-items: center;
		font-size: 18px;
		/* font-weight: 800; */
		/* letter-spacing: 0.4px; */
		color: var(--primary-color);
		margin: 0 auto;
		/* max-width: 1400px; */
		justify-content: stretch;
	}
  #header-container :global(a) {
    color: var(--tertiary);
		/* font-weight: 800; */
  }
	/* header a:visited {
		color: var(--primary-color);
	} */
</style>
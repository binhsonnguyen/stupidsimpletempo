<!-- src/routes/+page.svelte -->
<script>
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import MainContentWrapper from "$lib/components/MainContentWrapper.svelte";
    import Dial from "$lib/features/dial/Dial.svelte";
</script>

<Header />

<!--d-flex: Biến main thành một flex container-->
<!--align-items-center: Căn giữa các phần tử con của main theo chiều dọc (cross-axis)-->
<!--justify-content-center: Căn giữa các phần tử con của main theo chiều ngang (main-axis).-->
<main class="flex-grow-1 d-flex align-items-center justify-content-center">
    <MainContentWrapper>
        <Dial/>
    </MainContentWrapper>
</main>

<Footer />

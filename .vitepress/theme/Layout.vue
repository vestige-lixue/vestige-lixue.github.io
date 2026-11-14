<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
</script>

<template>
    <DefaultTheme.Layout>
        <template #home-hero-info-before>
            <h1 class="hero-logo">
                <img class="light" src="/logo-black.svg" alt="Vestige" />
                <img class="dark" src="/logo-white.svg" alt="Vestige" />
            </h1>
        </template>
        <!-- Reserves the right column of the hero for the demo recording. -->
        <template #home-hero-image>
            <div class="hero-media" />
        </template>
    </DefaultTheme.Layout>
</template>
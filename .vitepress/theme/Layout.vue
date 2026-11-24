<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import HeroDemo from "./HeroDemo.vue";
</script>

<template>
    <DefaultTheme.Layout>
        <template #home-hero-info-before>
            <h1 class="hero-logo">
                <img class="light" src="/logo-black.svg" alt="Vestige" />
                <img class="dark" src="/logo-white.svg" alt="Vestige" />
            </h1>
        </template>
        <template #home-hero-image>
            <HeroDemo />
        </template>
    </DefaultTheme.Layout>
</template>
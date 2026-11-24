<script setup lang="ts">
import { useData } from "vitepress";
import { computed, onMounted, ref, watch } from "vue";

const { isDark } = useData();
const theme = computed(() => isDark.value ? "dark" : "light");
// The appearance and motion preference are known only in the browser, so the server renders the empty frame.
const mounted = ref(false);
const still = ref(false);

onMounted(() => {
    still.value = matchMedia("(prefers-reduced-motion: reduce)").matches;
    mounted.value = true;
});

// Switching the appearance replaces the video; the new one continues from the old one's time.
const video = ref<HTMLVideoElement | null>(null);
let resumeAt = 0;
watch(theme, () => {
    resumeAt = video.value?.currentTime ?? 0;
}, { flush: "pre" });

function resume(event: Event): void {
    const target = event.target as HTMLVideoElement;
    if (resumeAt) target.currentTime = resumeAt % target.duration;
    resumeAt = 0;
}

const description = "Vestige plays a speech while the transcript follows along, then replaces a misrecognized name with the one another transcription found.";
</script>

<template>
    <div class="hero-media">
        <template v-if="mounted">
            <img v-if="still" :src="`/demo/demo-${theme}.webp`" :alt="description" />
            <video v-else ref="video" :key="theme" @loadedmetadata="resume" :poster="`/demo/demo-${theme}.webp`" :aria-label="description" autoplay muted loop playsinline>
                <source :src="`/demo/demo-${theme}.av1.webm`" type="video/webm; codecs=av01.0.08M.08" />
                <source :src="`/demo/demo-${theme}.vp9.webm`" type="video/webm; codecs=vp9" />
                <source :src="`/demo/demo-${theme}.mp4`" type="video/mp4" />
            </video>
        </template>
    </div>
</template>

<style scoped>
.hero-media {
    overflow: hidden;
}

.hero-media img,
.hero-media video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
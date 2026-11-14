import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Download from "./Download.vue";
import Layout from "./Layout.vue";
import "./style.css";

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component("Download", Download);
    },
} satisfies Theme;
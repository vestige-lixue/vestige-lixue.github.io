import { defineConfig } from "vitepress";

const repository = "https://github.com/vestige-lixue/vestige";

export default defineConfig({
    title: "Vestige",
    cleanUrls: true,
    lastUpdated: false,
    head: [
        ["link", { rel: "icon", type: "image/png", href: "/logo-square-black.png", media: "(prefers-color-scheme: light)" }],
        ["link", { rel: "icon", type: "image/png", href: "/logo-square-white.png", media: "(prefers-color-scheme: dark)" }],
    ],
    themeConfig: {
        logo: { light: "/logo-black.svg", dark: "/logo-white.svg", alt: "Vestige" },
        siteTitle: false,
        socialLinks: [{ icon: "github", link: repository }],
        footer: { copyright: "© 2026 LJM12914" },
        search: {
            provider: "local",
            options: {
                locales: {
                    "zh-cn": {
                        translations: {
                            button: { buttonText: "搜索", buttonAriaLabel: "搜索" },
                            modal: {
                                noResultsText: "没有找到结果",
                                resetButtonTitle: "清除",
                                footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
                            },
                        },
                    },
                },
            },
        },
    },
    locales: {
        root: {
            label: "English",
            lang: "en-US",
            description: "A local workspace for media transcription and proofreading.",
            themeConfig: {
                nav: [
                    { text: "Guide", link: "/guide/" },
                    { text: "Download", link: "/download" },
                ],
                sidebar: {
                    "/guide/": [
                        {
                            text: "Documentation",
                            items: [
                                { text: "User guide", link: "/guide/" },
                                { text: "Parameter reference", link: "/guide/params" },
                            ],
                        },
                    ],
                },
                outline: { level: [2, 3], label: "On this page" },
            },
        },
        "zh-cn": {
            label: "简体中文",
            lang: "zh-CN",
            link: "/zh-cn/",
            description: "一个用于录音转写与校对的本地工作空间。",
            themeConfig: {
                nav: [
                    { text: "指南", link: "/zh-cn/guide/" },
                    { text: "下载", link: "/zh-cn/download" },
                ],
                sidebar: {
                    "/zh-cn/guide/": [
                        {
                            text: "文档",
                            items: [
                                { text: "使用文档", link: "/zh-cn/guide/" },
                                { text: "参数说明", link: "/zh-cn/guide/params" },
                            ],
                        },
                    ],
                },
                outline: { level: [2, 3], label: "本页内容" },
                docFooter: { prev: "上一页", next: "下一页" },
                returnToTopLabel: "回到顶部",
                sidebarMenuLabel: "菜单",
                darkModeSwitchLabel: "外观",
                lightModeSwitchTitle: "切换到浅色模式",
                darkModeSwitchTitle: "切换到深色模式",
                langMenuLabel: "语言",
            },
        },
    },
});
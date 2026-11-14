<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";

type Platform = "windows" | "macos" | "linux";

interface Asset {
    name: string;
    size: number;
    browser_download_url: string;
}

interface Release {
    tag_name: string;
    prerelease: boolean;
    html_url: string;
    published_at: string;
    assets: Asset[];
}

interface Package {
    platform: Platform;
    label: string;
    rank: number;
    asset: Asset;
}

const releasesPage = "https://github.com/vestige-lixue/vestige/releases";
// Every release so far is a pre-release, which /releases/latest skips; the list is newest first.
const releaseList = "https://api.github.com/repos/vestige-lixue/vestige/releases?per_page=1";

const strings = {
    "en-US": {
        loading: "Loading the latest release…",
        failed: "Could not load the latest release.",
        allReleases: "All releases on GitHub",
        version: "Latest version",
        prerelease: "Pre-release",
        checksums: "SHA-256 checksums",
        detected: "Your system",
        platforms: { windows: "Windows", macos: "macOS", linux: "Linux" },
        kinds: { setup: "Installer", dmg: "Disk image", AppImage: "AppImage", deb: "Debian package" },
        arches: { x64: "x64", arm64: "ARM64", macX64: "Intel", macArm64: "Apple silicon" },
    },
    "zh-CN": {
        loading: "正在读取最新版本……",
        failed: "无法读取最新版本。",
        allReleases: "在 GitHub 上查看所有版本",
        version: "最新版本",
        prerelease: "预发布",
        checksums: "SHA-256 校验和",
        detected: "当前系统",
        platforms: { windows: "Windows", macos: "macOS", linux: "Linux" },
        kinds: { setup: "安装程序", dmg: "磁盘映像", AppImage: "AppImage", deb: "Debian 软件包" },
        arches: { x64: "x64", arm64: "ARM64", macX64: "Intel", macArm64: "Apple 芯片" },
    },
};

const { lang } = useData();
const text = computed(() => strings[lang.value as keyof typeof strings] ?? strings["en-US"]);

const release = ref<Release | null>(null);
const failed = ref(false);
const detected = ref<Platform | null>(null);

function detectPlatform(): Platform | null {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const source = `${nav.userAgentData?.platform ?? ""} ${navigator.userAgent}`.toLowerCase();
    if (source.includes("win")) return "windows";
    if (source.includes("mac")) return "macos";
    if (source.includes("linux") && !source.includes("android")) return "linux";
    return null;
}

function describe(asset: Asset): Package | null {
    const match = /-(x64|x86_64|amd64|arm64)(?:-(setup))?\.(exe|dmg|AppImage|deb)$/.exec(asset.name);
    if (!match) return null;
    const arm = match[1] === "arm64";
    const labels = text.value;
    // x64 before ARM64; on Linux, AppImage before deb.
    const rank = (match[3] === "deb" ? 2 : 0) + (arm ? 1 : 0);
    if (match[3] === "exe" && match[2] === "setup") {
        return { platform: "windows", label: `${labels.kinds.setup} (${arm ? labels.arches.arm64 : labels.arches.x64})`, rank, asset };
    }
    if (match[3] === "dmg") {
        return { platform: "macos", label: `${labels.kinds.dmg} (${arm ? labels.arches.macArm64 : labels.arches.macX64})`, rank, asset };
    }
    if (match[3] === "AppImage" || match[3] === "deb") {
        return { platform: "linux", label: `${labels.kinds[match[3]]} (${arm ? labels.arches.arm64 : labels.arches.x64})`, rank, asset };
    }
    return null;
}

const groups = computed(() => {
    const order: Platform[] = ["windows", "macos", "linux"];
    if (detected.value) order.sort((a, b) => Number(b === detected.value) - Number(a === detected.value));
    const packages = (release.value?.assets ?? []).map(describe).filter(item => item !== null).sort((a, b) => a.rank - b.rank);
    return order
        .map(platform => ({ platform, packages: packages.filter(item => item.platform === platform) }))
        .filter(group => group.packages.length > 0);
});

const checksums = computed(() => release.value?.assets.find(asset => asset.name === "SHA256SUMS") ?? null);

function formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

onMounted(async () => {
    detected.value = detectPlatform();
    try {
        const response = await fetch(releaseList, { headers: { Accept: "application/vnd.github+json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const releases = await response.json() as Release[];
        if (releases.length === 0) throw new Error("No releases");
        release.value = releases[0];
    }
    catch {
        failed.value = true;
    }
});
</script>

<template>
    <div class="download">
        <p v-if="failed">
            {{ text.failed }} <a :href="releasesPage">{{ text.allReleases }}</a>
        </p>
        <p v-else-if="!release">{{ text.loading }}</p>
        <template v-else>
            <p>
                {{ text.version }}: <a :href="release.html_url">{{ release.tag_name }}</a>
                <span v-if="release.prerelease" class="badge">{{ text.prerelease }}</span>
            </p>
            <section v-for="group in groups" :key="group.platform" class="group" :class="{ detected: group.platform === detected }">
                <h3>
                    {{ text.platforms[group.platform] }}
                    <span v-if="group.platform === detected" class="badge">{{ text.detected }}</span>
                </h3>
                <ul>
                    <li v-for="item in group.packages" :key="item.asset.name">
                        <a :href="item.asset.browser_download_url">{{ item.label }}</a>
                        <span class="meta">{{ item.asset.name }} · {{ formatSize(item.asset.size) }}</span>
                    </li>
                </ul>
            </section>
            <p>
                <a v-if="checksums" :href="checksums.browser_download_url">{{ text.checksums }}</a>
                <template v-if="checksums"> · </template>
                <a :href="releasesPage">{{ text.allReleases }}</a>
            </p>
        </template>
    </div>
</template>

<style scoped>
.group {
    margin: 16px 0;
    padding: 4px 20px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}

.group.detected {
    border-color: var(--vp-c-brand-1);
}

.group h3 {
    margin-top: 16px;
}

.badge {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--vp-c-brand-1);
}

.meta {
    margin-left: 8px;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
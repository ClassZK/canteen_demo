import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import setUp from "vite-plugin-vue-setup-extend";
import VueComponentsVite from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import AutoImportVite from "unplugin-auto-import/vite";
import ElementPlusVite from "unplugin-element-plus/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      setUp(),
      VueComponentsVite({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
      }),
      AutoImportVite({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
      }),
      ElementPlusVite({
        useSource: true,
      }),
    ],
    base: "",
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@use "@/assets/styles/theme.scss" as *;`,
        },
      },
    },
    build: {
      sourcemap: mode === "development" ? true : false,
      // 打包时进行代码分割
      rollupOptions: {
        output: {
          // 静态资源打包做处理
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
      // 打包压缩和优化配置
      minify: "terser",
      assetsInlineLimit: 1,
      chunkSizeWarningLimit: 2000, // 控制大小警告的大小限制
      terserOptions: {
        compress: {
          drop_console: true, // 移除console语句
          drop_debugger: true, // 移除debugger语句
        },
      },
    },
    server: {
      port: 1350,
      host: "0.0.0.0",
    },
  };
});

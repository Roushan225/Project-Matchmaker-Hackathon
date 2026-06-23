import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDirectory, "../..");
loadEnvConfig(workspaceRoot);

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@project-matchmaker/shared"],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

const workspaceRoot = path.join(process.cwd(), "../..");
loadEnvConfig(workspaceRoot);

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@project-matchmaker/shared"],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transformers.js pulls in native onnxruntime binaries; keep it out of the
  // bundler so it loads as a normal Node dependency on the server.
  serverExternalPackages: ["@huggingface/transformers"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/predict-carbon",
        destination: "http://127.0.0.1:8000/predict-carbon",
      },
      {
        source: "/ai-coach",
        destination: "http://127.0.0.1:8000/ai-coach",
      },
      {
        source: "/ocr",
        destination: "http://127.0.0.1:8000/ocr",
      },
      {
        source: "/forecast",
        destination: "http://127.0.0.1:8000/forecast",
      },
      {
        source: "/routes",
        destination: "http://127.0.0.1:8000/routes",
      },
      {
        source: "/auth/:path*",
        destination: "http://127.0.0.1:8000/auth/:path*",
      },
      {
        source: "/activities/:path*",
        destination: "http://127.0.0.1:8000/activities/:path*",
      },
      {
        source: "/goals/:path*",
        destination: "http://127.0.0.1:8000/goals/:path*",
      },
      {
        source: "/challenges/:path*",
        destination: "http://127.0.0.1:8000/challenges/:path*",
      },
      {
        source: "/community/:path*",
        destination: "http://127.0.0.1:8000/community/:path*",
      },
      {
        source: "/reports/:path*",
        destination: "http://127.0.0.1:8000/reports/:path*",
      },
    ];
  },
};

export default nextConfig;

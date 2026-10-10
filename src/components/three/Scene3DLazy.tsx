"use client";

import dynamic from "next/dynamic";

// WebGL needs the browser, so the 3D scene is loaded client-side only
// and kept out of the initial JS bundle.
const Scene3DLazy = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-muted" />,
});

export default Scene3DLazy;

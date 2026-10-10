"use client";

import dynamic from "next/dynamic";

// WebGL runs in the browser only and stays out of the initial bundle.
const OrbLazy = dynamic(() => import("./ArchetypeOrb"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-primary/10" />,
});

export default OrbLazy;

"use client";

import dynamic from "next/dynamic";

const TableComplete = dynamic(
    () => import("@/components/tableBase/tableBase"),
    { ssr: false } 
  ); 

export default function Franquias() {
    return (
        <>
        <TableComplete/>
        </>
    )
};


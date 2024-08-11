"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HomePage() {
    return (
      <div className="flex flex-col items-center overflow-hidden">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Deine Finanzen im Überblick
        </h1>
        <blockquote className="mt-6 pl-6 italic">
          &quot;Nichts ist ist besser als ein Überblick über seine Ausgaben zu
          haben.&quot;
        </blockquote>

        <ContainerScroll
          titleComponent={
            <>
              <h1 className="mt-1 text-4xl font-bold leading-none md:text-[6rem]">
                Jahresübersicht
              </h1>
            </>
          }
        >
          <Image
            src={`/title.png`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto h-full rounded-2xl object-cover"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";

interface ScalableSlideContainerProps {
    children: React.ReactNode;
}

/**
 * A container that scales its content to fit the available width.
 * It also dynamically measures the content height to ensure correct vertical spacing.
 */
export const ScalableSlideContainer = ({ children }: ScalableSlideContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentWrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(SLIDE_MAX_WIDTH * (9 / 16));

    // 1. Determine Scale based on available width
    useEffect(() => {
        if (!containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;
            const { width } = containerRef.current.getBoundingClientRect();
            // Calculate scale based on available width, maxing out at 1 (no zoom in beyond 100%)
            const targetScale = Math.min(1, width / SLIDE_MAX_WIDTH);
            setScale(targetScale);
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    // 2. Measure actual content height to adjust container height
    useEffect(() => {
        if (!contentWrapRef.current) return;

        const updateHeight = () => {
            if (contentWrapRef.current) {
                const child = contentWrapRef.current.firstElementChild as HTMLElement;
                if (child) {
                    // Use scrollHeight to capture full content area including bottom padding
                    setContentHeight(child.scrollHeight);
                } else {
                    setContentHeight(contentWrapRef.current.offsetHeight);
                }
            }
        };

        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(contentWrapRef.current);

        // Also watch for child changes to capture dynamic content updates
        const mutationObserver = new MutationObserver(updateHeight);
        mutationObserver.observe(contentWrapRef.current, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    const minHeight = SLIDE_MAX_WIDTH * (9 / 16);
    // Ensure we at least show the 16:9 base aspect ratio
    const finalContentHeight = Math.max(minHeight, contentHeight);

    return (
        <div
            ref={containerRef}
            className="w-full flex justify-center transition-all duration-300 ease-in-out"
            style={{
                // Add a tiny bit of extra buffer (4px) to avoid precision overlaps in rendering
                height: Math.ceil(finalContentHeight * scale) + 4,
            }}
        >
            <div
                style={{
                    width: SLIDE_MAX_WIDTH,
                    minHeight: minHeight,
                    // transform scales purely visually, so flow layout needs to know the scaled space
                    // which we handle in the parent wrapper height.
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                <div ref={contentWrapRef} className="h-full w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

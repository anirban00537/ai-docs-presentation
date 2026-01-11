import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    selectTheme,
    selectActiveSlideId,
    DEFAULT_THEME,
    setActiveSlide,
    reorderSlides,
} from "@/store/slices/slidesSlice";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSlideItem } from "./SortableSlideItem";
import { SlideCanvas } from "@/app/(protected)/docs/[id]/engine";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";

interface SidebarListProps {
    slides: Slide[];
    containerWidth: number;
    onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
    onDeleteRow: (slideId: string, rowId: string) => void;
    onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
    onAddRowAtTop: (slideId: string) => void;
    onAddRowAtBottom: (slideId: string) => void;
    onUpdateColumnWidths: (
        slideId: string,
        rowId: string,
        columnWidths: number[]
    ) => void;
    onDeleteSlide: (slideId: string) => void;
}

export const SidebarList: React.FC<SidebarListProps> = ({
    slides,
    containerWidth,
    onUpdateBlock,
    onDeleteRow,
    onAddColumn,
    onAddRowAtTop,
    onAddRowAtBottom,
    onUpdateColumnWidths,
    onDeleteSlide: onDeleteSlideProp,
}) => {
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";
    const activeSlideId = useAppSelector(selectActiveSlideId);
    const dispatch = useAppDispatch();

    // Measurements
    const availableWidth = Math.max(0, containerWidth - 48);
    const scale = availableWidth / SLIDE_MAX_WIDTH;
    const slideHeight = SLIDE_MAX_WIDTH * (9 / 16);
    const thumbnailHeight = slideHeight * scale;

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Virtualizer - Spacing increased to 8px (matches mb-2)
    const rowVirtualizer = useVirtualizer({
        count: slides.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => thumbnailHeight + 8,
        overscan: 5,
    });

    // Derived Props for Slide Render
    const renderSlideProps = useMemo(() => ({
        onUpdateBlock,
        onDeleteRow,
        onAddColumn,
        onAddRowAtTop,
        onAddRowAtBottom,
        onUpdateColumnWidths,
    }), [onUpdateBlock, onDeleteRow, onAddColumn, onAddRowAtTop, onAddRowAtBottom, onUpdateColumnWidths]);

    // Scroll active slide into view
    useEffect(() => {
        if (activeSlideId && !activeDragId) {
            const activeIndex = slides.findIndex(s => s.id === activeSlideId);
            if (activeIndex !== -1) {
                setTimeout(() => {
                    try {
                        rowVirtualizer.scrollToIndex(activeIndex, { align: 'center', behavior: 'smooth' });
                    } catch (e) { }
                }, 50);
            }
        }
    }, [activeSlideId, activeDragId, slides, rowVirtualizer]);

    // Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (over && active.id !== over.id) {
            const oldIndex = slides.findIndex((s) => s.id === active.id);
            const newIndex = slides.findIndex((s) => s.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                dispatch(reorderSlides({ slideId: active.id as string, newIndex }));
            }
        }
    };

    const handleSlideClick = useCallback((slideId: string) => {
        dispatch(setActiveSlide(slideId));
    }, [dispatch]);

    const activeDragSlide = useMemo(() =>
        slides.find((s) => s.id === activeDragId),
        [slides, activeDragId]);

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: { opacity: '0.4' },
            },
        }),
    };

    return (
        <div
            ref={scrollContainerRef}
            className={`relative flex-1 overflow-y-auto pl-4 pr-3 pt-1 pb-4 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={slides.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const slide = slides[virtualRow.index];
                            if (!slide) return null;

                            return (
                                <div
                                    key={slide.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <SortableSlideItem
                                        slide={slide}
                                        index={virtualRow.index}
                                        isActive={slide.id === activeSlideId}
                                        theme={theme}
                                        isDark={isDark}
                                        scale={scale}
                                        slideHeight={slideHeight}
                                        thumbnailHeight={thumbnailHeight}
                                        containerWidth={availableWidth}
                                        onSlideClick={handleSlideClick}
                                        onDeleteSlide={onDeleteSlideProp}
                                        slideCount={slides.length}
                                        renderSlideProps={renderSlideProps}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeDragSlide ? (
                        <div className="opacity-90 cursor-grabbing" style={{ width: `${availableWidth}px` }}>
                            <div
                                className="relative overflow-hidden rounded-xl shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-transparent transform scale-105"
                                style={{
                                    height: `${thumbnailHeight}px`,
                                    width: `${availableWidth}px`,
                                    backgroundColor: theme.cardBackground,
                                }}
                            >
                                <div
                                    className="absolute top-0 left-0 pointer-events-none origin-top-left"
                                    style={{
                                        transform: `scale(${scale})`,
                                        width: `${SLIDE_MAX_WIDTH}px`,
                                        height: `${slideHeight}px`,
                                    }}
                                >
                                    <SlideCanvas slide={activeDragSlide} {...renderSlideProps} enableDragHints={false} readOnly={true} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

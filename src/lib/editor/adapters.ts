import type { Slide as ReduxSlide } from "@/lib/editor/types";

export const convertApiSlideToRedux = (apiSlide: any): ReduxSlide => ({
  id: apiSlide.id,
  rows: apiSlide.data?.rows || [],
});

export const convertReduxSlideToApi = (reduxSlide: ReduxSlide): any => ({
  data: {
    rows: reduxSlide.rows,
  },
});


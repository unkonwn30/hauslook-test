import { sileo } from "sileo";

const base = {
  fill: "#0B0B0C",
  duration: 2500,
  roundness: 14,
  styles: {
    title: "text-white!",
    description: "text-white/70!",
    badge: "bg-white/15!",
    button: "bg-white/10!",
  },
} as const;

export const toast = {
  success: (title: string, description?: string) =>
    sileo.success({ ...base, title, description }),

  error: (title: string, description?: string) =>
    sileo.error({ ...base, title, description, duration: 3500 }),

  info: (title: string, description?: string) =>
    sileo.info({ ...base, title, description }),

  promise<T>(
    p: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return sileo.promise(p, {
      loading: { title: messages.loading },
      success: () => ({ ...base, title: messages.success }),
      error: (e) => ({
        ...base,
        title: messages.error,
        description: e instanceof Error ? e.message : "Error",
        duration: 3500,
      }),
    });
  },
};

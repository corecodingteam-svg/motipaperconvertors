/** The app scrolls inside <main> (see Layout), so window.scrollTo alone does nothing. */
export function scrollToTop() {
  document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

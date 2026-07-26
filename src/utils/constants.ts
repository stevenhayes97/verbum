// Default ceiling on how many cards a set shows when the user hasn't typed
// an explicit count. Not a performance guard (shuffle/filter/slice are all
// cheap even at large N, and only one card renders at a time) -- it's a
// practicality one: without it, "All tags" on the "All" deck would hand you
// every card in the app as a single session. An explicit count above this
// is always honored, up to the actual pool size.
export const DEFAULT_MAX_CARDS = 150;

// Cap on how many tags can be selected at once in the set customizer, so
// the tag-picker stays a quick, scannable choice rather than turning into
// "select nearly everything."
export const MAX_SELECTED_TAGS = 10;

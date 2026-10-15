/**
 * Pre-launch: chat is open to every signed-in member so the trainer can test it.
 * Set NEXT_PUBLIC_CHAT_OPEN_FOR_ALL=false to limit it to Premium plans.
 */
export function chatOpenForAll(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_OPEN_FOR_ALL !== "false";
}

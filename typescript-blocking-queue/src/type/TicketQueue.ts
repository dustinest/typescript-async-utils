export type TicketType = string | null | undefined;

export interface TicketQueue {
  reserve(): string;
  size(): number;
  isEmpty(): boolean;
  getMyPlace(ticket?: TicketType): number;
  isMyTurn(ticket?: TicketType): boolean
  done(ticket: TicketType): boolean;
}

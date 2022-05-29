import {TicketQueue, TicketType} from "../type/TicketQueue";

class BlockingTicketQueue implements TicketQueue {
  private readonly tickets: string[] = [];

  isEmpty(): boolean {
    return this.size() === 0;
  }

  size(): number {
    return this.tickets.length;
  }

  public reserve(): string {
    const startStr = Date.now().toString();
    const endStr = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    const ticket = `${startStr}-${endStr}`;
    this.tickets.push(ticket);
    return ticket;
  }

  public getMyPlace(ticket?: TicketType): number {
    if (ticket !== null && ticket !== undefined && this.tickets.length > 0) {
      return this.tickets.indexOf(ticket);
    }
    return this.tickets.length;
  }

  public isMyTurn(ticket?: TicketType) {
    return this.getMyPlace(ticket) === 0;
  }

  public done(ticket?: TicketType): boolean {
    if (ticket === undefined || ticket === null) {
      return true;
    }
    const index = this.tickets.indexOf(ticket);
    if (index < 0) return false;
    const removed = this.tickets.splice(index, 1);
    return removed.length === 1;
  }
}

export const newBlockingTicketQueue = (): TicketQueue => new BlockingTicketQueue();

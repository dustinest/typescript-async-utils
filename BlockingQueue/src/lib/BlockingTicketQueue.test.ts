import {newBlockingTicketQueue} from "./BlockingTicketQueue";

describe("Tickets generated are always unique", () => {
  const queue = newBlockingTicketQueue();
  const tickets: string[] = [queue.reserve()];
  it("Tickets can be reserved", () => {
    for (let i = 1; i < 100; i++) {
      expect(queue.getMyPlace()).toBe(i);
      expect(queue.isMyTurn()).toBeFalsy();
      const ticket = queue.reserve();
      tickets.push(ticket);

      expect(ticket.length).toBe(18);
      expect(queue.getMyPlace(ticket)).toBe(i);
      expect(queue.isMyTurn(ticket)).toBeFalsy();
    }
  });
  it.each([null, undefined]) ("Ticket is done when ticket is %s", (ticket) => {
    expect(queue.done(ticket)).toBeTruthy();
  });

  it.each(["abc"]) ("Ticket is done when ticket is %s", (ticket) => {
    expect(queue.done(ticket)).toBeFalsy();
  });


  it.each([null, undefined, tickets[5], "abc"]) ("The queue is full I do not have my turn %s", (ticket) => {
    expect(queue.isMyTurn(ticket)).toBeFalsy();
  });

  it ("Tickets can be released also in random order", () => {
    while(tickets.length > 0) {
      const index = Math.floor(Math.random() * tickets.length);
      const ticket = tickets.splice(index, 1);
      expect(queue.done(ticket[0])).toBeTruthy();
    }
  });

  it.each([null, undefined, tickets[5], "abc"]) ("The queue is empty it is my turn again %s", (ticket) => {
    expect(queue.isMyTurn(ticket)).toBeTruthy();
  });
});

describe("When queue is empty works", () => {
  const queue = newBlockingTicketQueue();
  it.each([null, undefined, "abc"])("it is always my turn when ticket is %s", (ticket) => {
    expect(queue.isMyTurn(ticket)).toBeTruthy();
  });
  it.each([null, undefined, "abc"])("My place for ticket %s is always 0", (ticket) => {
    expect(queue.getMyPlace(ticket)).toBe(0);
  });
});

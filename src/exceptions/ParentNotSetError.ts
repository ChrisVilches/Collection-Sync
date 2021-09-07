class ParentNotSetError extends Error {
  constructor(extraMessage?: string) {
    const messages: string[] = [
      "Operation cannot be executed because node has no parent defined",
    ];

    if(typeof extraMessage === 'string' && extraMessage.trim().length > 0){
      messages.push(extraMessage);
    }

    super(messages.join(": "));

    Object.setPrototypeOf(this, ParentNotSetError.prototype);
  }
}

export default ParentNotSetError;

import {hasNoValue, hasValue} from "../hasValue";

export class Optional<T> {
  private readonly value: T | null | undefined;

  private constructor(value: T | null | undefined) {
    this.value = value;
  }

  filter(filter: (value: T) => boolean): Optional<T> {
    if (this.isPresent()) {
      return filter(this.value as T) ? this: Optional.empty();
    }
    return this;
  }

  flatMap<S>(mapper: (value: T) => Optional<S>): Optional<S> {
    if (this.isPresent()) {
      return mapper(this.value as T);
    }
    return Optional.empty();
  }

  map<S>(mapper: (value: T) => S): Optional<S> {
    if (this.isPresent()) {
      return Optional.ofNullable(mapper(this.value as T));
    }
    return Optional.empty();
  }

  get(): T {
    if (this.isEmpty()) {
      throw new Error("The value is null or undefined or Number.NAN!");
    }
    return this.value as T;
  }

  ifPresent(consumer: (value: T) => void): void {
    if (this.isPresent()) consumer(this.value as T);
  }

  isPresent(): boolean {
    return hasValue(this.value);
  }

  isEmpty(): boolean {
    return hasNoValue(this.value);
  }

  orElse<R extends T | null | undefined>(defaultValue: R ): T | R {
    if (this.isPresent()) {
      return this.value as T;
    }
    return defaultValue;
  }

  orElseGet<R extends T | null | undefined>(provider: () => R ): T | R {
    if (this.isPresent()) {
      return this.value as T;
    }
    return provider();
  }

  ifPresentOrElse(consumer: (value: T) => void, orElseConsumer: () => void) {
    if (this.isPresent())
      consumer(this.value as T);
    else
      orElseConsumer();
  }

  public static ofNullable<T>(data: T | undefined | null): Optional<T> {
    return new Optional(data);
  }

  public static of<T>(
    data: T extends null | undefined ? never : T
  ): Optional<T> {
    if (hasNoValue(data))
      throw new Error("Value should never be null nor undefined!");
    return Optional.ofNullable(data);
  }

  public static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }
}

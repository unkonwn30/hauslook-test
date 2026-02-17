import type { Customer } from "./customer";

export interface CustomersRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
}

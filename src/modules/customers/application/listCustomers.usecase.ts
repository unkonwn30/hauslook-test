import type { Customer } from "../domain/customer";
import type { CustomersRepository } from "../domain/customers.repository";

export class ListCustomersUseCase {
  private readonly repo: CustomersRepository;

  constructor(repo: CustomersRepository) {
    this.repo = repo;
  }

  execute(): Promise<Customer[]> {
    return this.repo.findAll();
  }
}

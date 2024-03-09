import { PaginationOutput } from '@/shared/dto/pagination-output';
import { SearchInput } from '../../shared/dto/search-input';
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository';
import { AuthorOutput } from '../types/author-output';


export namespace ListAuthorsUsecase {
  export type Input = SearchInput

  export type Output = PaginationOutput<AuthorOutput>

  export class UseCase {

    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {

      const searchResult = await this.authorsRepository.search(input)

      return {
        items: searchResult.items,
        currentPage: searchResult.currentPage,
        lastPage: searchResult.lastPage,
        perPage: searchResult.perPage,
        total: searchResult.total,
      }
    }
  }
}

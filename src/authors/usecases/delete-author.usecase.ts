import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { AuthorOutput } from '../types/author-output'

export namespace DeleteAuthorUsecase {
  type Input = {
    id: string
  }

  export class UseCase {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<AuthorOutput> {
      const { id } = input

      const author = await this.authorsRepository.delete(id)

      return author
    }
  }
}

import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository';
import { AuthorOutput } from '../types/author-output';

export namespace GetAuthorUsecase {
  type Input = {
    id: string
  }

  export class UseCase {

    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<AuthorOutput> {
      const { id } = input;

      const author = await this.authorsRepository.findById(id)

      return author
    }
  }
}

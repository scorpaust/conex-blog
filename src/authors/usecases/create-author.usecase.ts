import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository';
import { BadRequestError } from '@/shared/errors/bad-request-error';
import { ConflictError } from '@/shared/errors/conflict-error';
import { AuthorOutput } from '../types/author-output';
export namespace CreateAuthorUsecase {

  type Input = {
    name: string
    email: string
  }

  export class UseCase {

    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<AuthorOutput> {
      const { name, email } = input;

      if (!email || !name) {
        throw new BadRequestError('Input data not provided.')
      }

      const emailExists = await this.authorsRepository.findByEmail(email)

      if (emailExists) {
        throw new ConflictError('Email address used by already registered author.')
      }

      const author = await this.authorsRepository.create(input)

      return author
    }
  }
}

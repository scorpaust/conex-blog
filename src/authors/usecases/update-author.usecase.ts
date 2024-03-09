import { Author } from '../graphql/models/author'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { AuthorOutput } from '../types/author-output'
import { BadRequestError } from '../../shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'

export namespace UpdateAuthorUsecase {
  type Input = Partial<Author>

  export class UseCase {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<AuthorOutput> {
      if (!input?.id) {
        throw new BadRequestError('Id not provided.')
      }

      const author = await this.authorsRepository.findById(input.id)

      if (input?.email) {
        const emailExists = await this.authorsRepository.findByEmail(
          input.email,
        )

        if (emailExists && emailExists.id !== input.id) {
          throw new ConflictError(
            'Email address used by already registered author.',
          )
        }

        author.email = input.email
      }

      if (input.name) {
        author.name = input.name
      }

      return this.authorsRepository.update(author)
    }
  }
}

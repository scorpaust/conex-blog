import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { Inject } from '@nestjs/common'
import { ListAuthorsUsecase } from '@/authors/usecases/list-authors.usecase'
import { SearchParamsArgs } from '../args/search-params.args'
import { SearchAuthorsResult } from '../models/search-authors-result'
import { CreateAuthorUsecase } from '@/authors/usecases/create-author.usecase'
import { CreateAuthorInput } from '../inputs/create-author.input'

@Resolver(() => Author)
export class AuthorsResolver {
  @Inject(ListAuthorsUsecase.UseCase)
  private ListAuthorsUsecase: ListAuthorsUsecase.UseCase

  @Inject(CreateAuthorUsecase.UseCase)
  private CreateAuthorUsecase: CreateAuthorUsecase.UseCase

  @Query(() => SearchAuthorsResult)
  async authors(
    @Args() { page, perPage, sort, sortDir, filter }: SearchParamsArgs,
  ) {
    const list = await this.ListAuthorsUsecase.execute({
      page,
      perPage,
      sort,
      sortDir,
      filter,
    })

    return list
  }

  @Mutation(() => Author)
  createAuthor(@Args('data') data: CreateAuthorInput) {
    return this.CreateAuthorUsecase.execute(data)
  }
}

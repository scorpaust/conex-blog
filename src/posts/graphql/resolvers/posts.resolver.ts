import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql'
import { Post } from '../models/post'
import { Inject } from '@nestjs/common'
import { CreatePostUseCase } from '@/posts/usecases/create-post.usecase'
import { CreatePostInput } from '../inputs/create-post.input'
import { GetAuthorUsecase } from '@/authors/usecases/get-author.usecase'
import { GetPostUseCase } from '@/posts/usecases/get-post.usecase'
import { PostIdArgs } from '../args/post-id.args'
import { PublishPostUseCase } from '@/posts/usecases/publish-post.usecase'
import { UnpublishPostUseCase } from '@/posts/usecases/unpublish-post.usecase'

@Resolver(() => Post)
export class PostsResolver {
  @Inject(CreatePostUseCase.UseCase)
  private createPostUsecase: CreatePostUseCase.UseCase

  @Inject(GetAuthorUsecase.UseCase)
  private getAuthorUsecase: GetAuthorUsecase.UseCase

  @Inject(GetPostUseCase.UseCase)
  private getPostUsecase: GetPostUseCase.UseCase

  @Inject(PublishPostUseCase.UseCase)
  private publishPostUsecase: PublishPostUseCase.UseCase

  @Inject(UnpublishPostUseCase.UseCase)
  private unpublishPostUsecase: UnpublishPostUseCase.UseCase

  @Query(() => Post)
  async getPostById(@Args() { id }: PostIdArgs) {
    return this.getPostUsecase.execute({ id })
  }

  @Mutation(() => Post)
  createPost(@Args('data') data: CreatePostInput) {
    return this.createPostUsecase.execute(data)
  }

  @Mutation(() => Post)
  publishPost(@Args() { id }: PostIdArgs) {
    return this.publishPostUsecase.execute({ id })
  }

  @Mutation(() => Post)
  unpublishPost(@Args() { id }: PostIdArgs) {
    return this.unpublishPostUsecase.execute({ id })
  }

  @ResolveField()
  author(@Parent() post: Post) {
    return this.getAuthorUsecase.execute({ id: post.authorId })
  }
}

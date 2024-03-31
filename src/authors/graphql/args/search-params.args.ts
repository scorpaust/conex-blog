import { ArgsType, Field, Int } from '@nestjs/graphql'
import { IsOptional, IsString, Min } from 'class-validator'

@ArgsType()
export class SearchParamsArgs {
  @IsOptional()
  @Min(1)
  @Field(() => Int, { nullable: true })
  page?: number

  @IsOptional()
  @Min(1)
  @Field(() => Int, { nullable: true })
  perPage?: number

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  sort?: string

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  sortDir?: 'asc' | 'desc'

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  filter?: string
}

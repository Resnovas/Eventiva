import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusCreateManyInput } from '../../../inputs/StatusCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyStatusArgs {
  @TypeGraphQL.Field((_type) => [StatusCreateManyInput], {
    nullable: false,
  })
  data!: StatusCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}

import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOnAccountCreateManyInput } from '../../../inputs/StatusOnAccountCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyStatusOnAccountArgs {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateManyInput], {
    nullable: false,
  })
  data!: StatusOnAccountCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}

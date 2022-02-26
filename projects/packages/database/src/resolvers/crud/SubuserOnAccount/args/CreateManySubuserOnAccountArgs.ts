import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubuserOnAccountCreateManyInput } from '../../../inputs/SubuserOnAccountCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManySubuserOnAccountArgs {
  @TypeGraphQL.Field((_type) => [SubuserOnAccountCreateManyInput], {
    nullable: false,
  })
  data!: SubuserOnAccountCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}

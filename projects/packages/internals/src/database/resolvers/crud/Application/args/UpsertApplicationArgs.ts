import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ApplicationCreateInput } from '../../../inputs/ApplicationCreateInput';
import { ApplicationUpdateInput } from '../../../inputs/ApplicationUpdateInput';
import { ApplicationWhereUniqueInput } from '../../../inputs/ApplicationWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertApplicationArgs {
  @TypeGraphQL.Field((_type) => ApplicationWhereUniqueInput, {
    nullable: false,
  })
  where!: ApplicationWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ApplicationCreateInput, {
    nullable: false,
  })
  create!: ApplicationCreateInput;

  @TypeGraphQL.Field((_type) => ApplicationUpdateInput, {
    nullable: false,
  })
  update!: ApplicationUpdateInput;
}

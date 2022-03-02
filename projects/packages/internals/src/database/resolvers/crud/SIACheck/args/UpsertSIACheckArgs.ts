import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIACheckCreateInput } from '../../../inputs/SIACheckCreateInput';
import { SIACheckUpdateInput } from '../../../inputs/SIACheckUpdateInput';
import { SIACheckWhereUniqueInput } from '../../../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertSIACheckArgs {
  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: false,
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SIACheckCreateInput, {
    nullable: false,
  })
  create!: SIACheckCreateInput;

  @TypeGraphQL.Field((_type) => SIACheckUpdateInput, {
    nullable: false,
  })
  update!: SIACheckUpdateInput;
}

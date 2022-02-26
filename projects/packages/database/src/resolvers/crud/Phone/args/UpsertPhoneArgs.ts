import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PhoneCreateInput } from '../../../inputs/PhoneCreateInput';
import { PhoneUpdateInput } from '../../../inputs/PhoneUpdateInput';
import { PhoneWhereUniqueInput } from '../../../inputs/PhoneWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertPhoneArgs {
  @TypeGraphQL.Field((_type) => PhoneWhereUniqueInput, {
    nullable: false,
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PhoneCreateInput, {
    nullable: false,
  })
  create!: PhoneCreateInput;

  @TypeGraphQL.Field((_type) => PhoneUpdateInput, {
    nullable: false,
  })
  update!: PhoneUpdateInput;
}

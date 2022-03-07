import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PhoneOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/PhoneOrderByWithRelationAndSearchRelevanceInput';
import { PhoneWhereInput } from '../../../inputs/PhoneWhereInput';
import { PhoneWhereUniqueInput } from '../../../inputs/PhoneWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregatePhoneArgs {
  @TypeGraphQL.Field((_type) => PhoneWhereInput, {
    nullable: true,
  })
  where?: PhoneWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [PhoneOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: PhoneOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => PhoneWhereUniqueInput, {
    nullable: true,
  })
  cursor?: PhoneWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}

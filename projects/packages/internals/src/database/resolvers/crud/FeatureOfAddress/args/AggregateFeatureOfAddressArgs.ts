import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput';
import { FeatureOfAddressWhereInput } from '../../../inputs/FeatureOfAddressWhereInput';
import { FeatureOfAddressWhereUniqueInput } from '../../../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateFeatureOfAddressArgs {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereInput, {
    nullable: true,
  })
  where?: FeatureOfAddressWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?:
    | FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: true,
  })
  cursor?: FeatureOfAddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}

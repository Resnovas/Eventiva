import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIACheckOrderByWithAggregationInput } from '../../../inputs/SIACheckOrderByWithAggregationInput';
import { SIACheckScalarWhereWithAggregatesInput } from '../../../inputs/SIACheckScalarWhereWithAggregatesInput';
import { SIACheckWhereInput } from '../../../inputs/SIACheckWhereInput';
import { SIACheckScalarFieldEnum } from '../../../../enums/SIACheckScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupBySIACheckArgs {
  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  where?: SIACheckWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: SIACheckOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    | 'id'
    | 'sia_id'
    | 'status'
    | 'AuthUrl'
    | 'pubUrl'
    | 'createdAt'
    | 'updatedAt'
    | 'deleted'
    | 'error'
    | 'transactionId'
  >;

  @TypeGraphQL.Field((_type) => SIACheckScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: SIACheckScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}

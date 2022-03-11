import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DomainOrderByWithAggregationInput } from "../../../inputs/DomainOrderByWithAggregationInput";
import { DomainScalarWhereWithAggregatesInput } from "../../../inputs/DomainScalarWhereWithAggregatesInput";
import { DomainWhereInput } from "../../../inputs/DomainWhereInput";
import { DomainScalarFieldEnum } from "../../../../enums/DomainScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByDomainArgs {
  @TypeGraphQL.Field(_type => DomainWhereInput, {
    nullable: true
  })
  where?: DomainWhereInput | undefined;

  @TypeGraphQL.Field(_type => [DomainOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: DomainOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [DomainScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "domain" | "verified" | "dnsType" | "data" | "createdAt" | "updatedAt" | "deleted">;

  @TypeGraphQL.Field(_type => DomainScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: DomainScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

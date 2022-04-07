import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ContactAtAddressOrderByWithAggregationInput } from "../../../inputs/ContactAtAddressOrderByWithAggregationInput";
import { ContactAtAddressScalarWhereWithAggregatesInput } from "../../../inputs/ContactAtAddressScalarWhereWithAggregatesInput";
import { ContactAtAddressWhereInput } from "../../../inputs/ContactAtAddressWhereInput";
import { ContactAtAddressScalarFieldEnum } from "../../../../enums/ContactAtAddressScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByContactAtAddressArgs {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereInput, {
    nullable: true
  })
  where?: ContactAtAddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ContactAtAddressOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"accountId" | "addressId" | "jobTitle" | "phone" | "emailId" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => ContactAtAddressScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ContactAtAddressScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

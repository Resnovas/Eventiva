import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ContactAtAddressOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/ContactAtAddressOrderByWithRelationAndSearchRelevanceInput";
import { ContactAtAddressWhereInput } from "../../../inputs/ContactAtAddressWhereInput";
import { ContactAtAddressWhereUniqueInput } from "../../../inputs/ContactAtAddressWhereUniqueInput";
import { ContactAtAddressScalarFieldEnum } from "../../../../enums/ContactAtAddressScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class AccountContactOfAddressArgs {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereInput, {
    nullable: true
  })
  where?: ContactAtAddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: ContactAtAddressOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: true
  })
  cursor?: ContactAtAddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"accountId" | "addressId" | "jobTitle" | "phone" | "emailId" | "createdAt" | "updatedAt" | "deletedDate" | "deleted"> | undefined;
}
